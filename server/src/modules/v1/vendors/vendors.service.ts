import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { getSkipTake } from 'util/pagination.util';
import { EntityManager, In } from 'typeorm';
import { Account } from '../accounts/account.entity';
import { Ingredient } from '../ingredients/ingredient.entity';
import { Pack } from '../ingredients/pack.entity';
import { PantryIngredient } from '../ingredients/pantry-ingredient.entity';
import { Pagination } from '../pagination/interface/pagination.interface';
import { UpdateVendorRequestDTO } from './dto';
import { CreateVendorRequestDTO } from './dto/create-vendor.dto';
import { Vendor, VendorAddress, VendorContact } from './entities';
import { LocationsService } from '@app/locations/locations.service';
import { VendorOrder } from './entities/order.entity';
import { OrderItem } from './interface/order-item.interface';
import { Order } from '../pos/order.entity';
import { omit, sum } from 'lodash';
import { ShortId } from 'util/short-id';
import { randomBytes } from 'crypto';
import { VendorOrderMethod } from './enum/order-method.enum';
import { VendorOrderState } from './enum/order-state.enum';
import { User } from '../users/user.entity';
import { ConfigService } from '@nestjs/config';
import { EmailsService, EmailTemplate } from '../emails/emails.service';
import { Transactional } from '@modules/infra/database/transactional.decorator';
import { VendorItem } from '../vendor-items/interface/vendor-item.interface';
import { UnitsService } from '../units/units.service';

export interface ImportPackDto {
  catalogNumber: string;
  price: number | string;
  numItems: number | string;
  amountPerItem: number | string;
  uom: string;
  ingredientName: string;
  makePrimary: boolean | string;
}

@Injectable()
export class VendorsService {
  constructor(
    @InjectEntityManager() private readonly manager: EntityManager,
    private readonly locationsService: LocationsService,
    private readonly configService: ConfigService,
    private readonly emailsService: EmailsService,
    private readonly unitsService: UnitsService,
  ) {}

  @Transactional()
  public async find({ page, pageSize }: Pagination, accountId: Account['id']) {
    const manager = Transactional.getManager();
    const location = await this.locationsService.getLocation(accountId);

    const { skip, take } = getSkipTake(page, pageSize);
    const [vendors, count] = await manager.findAndCount(Vendor, {
      skip,
      take,
      where: {
        location,
      },
      relations: ['address', 'primaryContact'],
    });
    return {
      vendors,
      numPages: Math.ceil(count / pageSize),
    };
  }

  @Transactional()
  public async findOne(id: Vendor['id'], accountId: Account['id']) {
    const manager = Transactional.getManager();
    const location = await this.locationsService.getLocation(accountId);
    return await manager.getRepository(Vendor).findOne(id, {
      where: { location },
      relations: ['address', 'primaryContact'],
    });
  }

  @Transactional()
  public async create(
    data: CreateVendorRequestDTO,
    accountId: Account['id'],
  ): Promise<Vendor['id']> {
    const manager = Transactional.getManager();
    const location = await this.locationsService.getLocation(accountId);

    const vendor = new Vendor();
    vendor.name = data.name;
    vendor.accountNumber = data.accountNumber;
    vendor.orderMethod = data.orderMethod;

    vendor.includePricesOnPurchaseOrders = data.includePricesOnPurchaseOrders;

    vendor.location = location;

    vendor.primaryContact = new VendorContact(data.primaryContact);
    vendor.address = new VendorAddress(data.address);

    await manager.save(vendor);
    return vendor.id;
  }

  public async update(
    id: Vendor['id'],
    data: UpdateVendorRequestDTO,
    manager: EntityManager = this.manager,
  ): Promise<void> {
    const vendor = await manager.findOne(Vendor, id, {
      relations: ['address', 'primaryContact'],
    });
    const {
      name,
      accountNumber,
      orderMethod,
      includePricesOnPurchaseOrders,
    } = data;
    Object.assign(vendor, {
      name,
      accountNumber,
      orderMethod,
      includePricesOnPurchaseOrders,
    });

    Object.assign(vendor.primaryContact, data.primaryContact);
    Object.assign(vendor.address, data.address);

    await manager.save(vendor);
  }

  @Transactional()
  public async getCatalog(
    id: Vendor['id'],
    accountId: Account['id'],
    { page, pageSize }: Partial<Pagination> = {},
  ) {
    const manager = Transactional.getManager();

    if (!page || !pageSize) {
      const packs = await manager
        .createQueryBuilder()
        .select('pack')
        .from(Pack, 'pack')
        .leftJoinAndSelect('pack.pantryIngredient', 'pantryIngredient')
        .leftJoinAndSelect('pack.itemUnit', 'unit')
        .where('pantryIngredient.ownerId = :accountId', { accountId })
        .andWhere('"vendorId" = :vendorId', { vendorId: id })
        .orderBy('pantryIngredient.name', 'ASC')
        .addOrderBy('pack.catalogNumber', 'ASC')
        .getMany();
      return packs.map((pack) => ({
        ...omit(pack, 'itemUnit'),
        unit: pack.itemUnit?.symbol,
      }));
    }

    const { skip, take } = getSkipTake(page, pageSize);
    const [items, count] = await manager
      .createQueryBuilder()
      .select('pack')
      .from(Pack, 'pack')
      .leftJoinAndSelect('pack.pantryIngredient', 'pantryIngredient')
      .leftJoinAndSelect('pack.itemUnit', 'unit')
      .where('pantryIngredient.ownerId = :accountId', { accountId })
      .andWhere('"vendorId" = :vendorId', { vendorId: id })
      .limit(take)
      .offset(skip)
      .getManyAndCount();

    return {
      items: items.map((item) => ({
        ...omit(item, 'itemUnit'),
        unit: item.itemUnit?.symbol,
      })),
      numPages: Math.ceil(count / pageSize),
    };
  }

  @Transactional()
  public async updateCatalog(
    vendorId: string,
    accountId: Account['id'],
    packs: ImportPackDto[],
  ): Promise<{
    updatedPacks: ImportPackDto[];
    newPacks: ImportPackDto[];
  }> {
    const manager = Transactional.getManager();

    const vendor = await manager.findOne(Vendor, vendorId, {
      relations: ['location'],
    });
    if (vendor.location.accountId !== accountId) throw new NotFoundException();

    const updatedPacks = [];
    const newPacks = [];

    for (const pack of packs) {
      const existingPack = pack.catalogNumber
        ? await manager.findOne(Pack, {
            vendorId,
            catalogNumber: pack.catalogNumber,
          })
        : false;

      if (existingPack) {
        await manager.update(Pack, existingPack.id, {
          price: `${+pack.price ?? 0}`,
        });
        updatedPacks.push(pack);
      } else {
        const scoreExpression =
          'GREATEST( word_similarity(:name, "name"), word_similarity("name", :name) )';

        const match = await manager
          .createQueryBuilder(PantryIngredient, 'pantryIngredient')
          .addSelect(scoreExpression, 'score')
          .where(`${scoreExpression} > :threshold`, { threshold: 0.6 })
          .andWhere('"ownerId" = :accountId', { accountId })
          .orderBy('"score"', 'DESC')
          .setParameters({ name: pack.ingredientName })
          .getOne();

        newPacks.push({
          ...pack,
          match: match
            ? {
                id: match.scopedId,
                name: match.name,
              }
            : null,
        });
      }
    }

    return { updatedPacks, newPacks };
  }

  @Transactional()
  public async confirmImport(
    vendorId: string,
    accountId: Account['id'],
    pack: ImportPackDto & { ingredient: { id: number } },
  ): Promise<void> {
    const manager = Transactional.getManager();

    const vendor = await manager.findOne(Vendor, vendorId, {
      relations: ['location'],
    });
    if (vendor.location.accountId !== accountId) throw new NotFoundException();

    const { catalogNumber } = pack;

    const ingredient = await manager.findOne(PantryIngredient, {
      scopedId: pack.ingredient.id,
      ownerId: accountId,
    });

    const existingPack = await manager.findOne(Pack, {
      vendorId,
      catalogNumber,
    });

    if (existingPack) {
      await manager.update(Pack, existingPack.id, {
        price: `${+pack.price ?? 0}`,
      });

      return;
    }

    await manager.insert(Pack, {
      vendorId,
      catalogNumber,
      pantryIngredientId: ingredient.id,
      price: `${pack.price ?? 0}`,
      numItems: `${pack.numItems ?? 1}`,
      amountPerItem: `${pack.amountPerItem ?? 1}`,
      itemUnit: await this.unitsService.findByAlias({
        ownerId: accountId,
        alias: pack.uom,
      }),
    });
  }

  public async getPacks(
    vendorId: Vendor['id'],
    ingredientId: Ingredient['scopedId'],
    accountId: Account['id'],
    manager: EntityManager = this.manager,
  ) {
    const pantryIngredient = await manager.findOne(PantryIngredient, {
      select: ['id'],
      where: {
        ownerId: accountId,
        scopedId: ingredientId,
      },
    });

    if (!pantryIngredient) throw new NotFoundException();

    const packs = await manager.find(Pack, {
      where: {
        vendorId: vendorId,
        pantryIngredientId: pantryIngredient.id,
      },
    });

    return packs;
  }

  @Transactional()
  public async findOrders(
    { page, pageSize }: Pagination,
    accountId: Account['id'],
  ) {
    const manager = Transactional.getManager();
    const location = await this.locationsService.getLocation(accountId);

    const { skip, take } = getSkipTake(page, pageSize);
    const [orders, count] = await manager.findAndCount(VendorOrder, {
      skip,
      take,
      where: {
        location,
      },
      order: {
        createdAt: 'DESC',
      },
      relations: ['vendor'],
    });

    return {
      orders,
      numPages: Math.ceil(count / pageSize),
    };
  }

  @Transactional()
  public async findOneOrder(id: Order['id'], accountId: Account['id']) {
    const manager = Transactional.getManager();
    const location = await this.locationsService.getLocation(accountId);
    return await manager.getRepository(VendorOrder).findOne(id, {
      where: { location },
      relations: [
        'vendor',
        'items',
        'items.pack',
        'items.pack.pantryIngredient',
      ],
    });
  }

  @Transactional()
  public async createOrder(
    vendorId: Vendor['id'],
    creatorId: User['id'],
    items: OrderItem[],
  ) {
    const manager = Transactional.getManager();

    const creator = await manager.findOne(User, creatorId);

    const location = await this.locationsService.getLocation(creator.accountId);

    const vendor = await manager.findOne(Vendor, {
      where: {
        id: vendorId,
        location,
      },
      relations: ['primaryContact', 'packs'],
    });

    if (!vendor) throw new NotFoundException();

    const count = await manager.count(Pack, {
      where: {
        vendor,
        id: In(items.map((item) => item.packId)),
      },
    });

    if (count !== items.length)
      throw new NotFoundException(
        'At least one provided Pack does not match the Vendor',
      );

    const order = new VendorOrder();
    order.location = location;
    order.vendor = vendor;

    order.creatorId = creatorId;
    order.shortId = ShortId.create(6).toString();
    order.key = randomBytes(32).toString('hex');

    order.state =
      vendor.orderMethod === VendorOrderMethod.EMAIL
        ? VendorOrderState.SENT
        : VendorOrderState.MANUAL;

    order.items = items.map((item) => ({
      packId: item.packId,
      numPacks: item.packs,
      pricePer: +vendor.packs.find(({ id }) => id === item.packId).price,
    }));

    const cost = sum(
      order.items.map((item) => +item.numPacks * +item.pricePer),
    );
    order.cost = cost;

    await manager.save(order);

    const orderNumber = order.shortId;

    if (
      vendor.orderMethod === VendorOrderMethod.EMAIL &&
      vendor.primaryContact.email
    ) {
      const email = vendor.primaryContact.email;
      const link = `${this.configService.get(
        'app.baseUrl',
      )}/po/${orderNumber}?key=${order.key}`;

      await this.emailsService.send(
        EmailTemplate.PURCHASE_ORDER,
        email,
        {
          orderNumber,
          link,
          restaurantName: location.name,
        },
        {
          replyTo: `${creator.name.replace(/[^a-zA-Z ]/g, '')} <${
            creator.email
          }>`,
        },
      );
    }

    return order;
  }
}
