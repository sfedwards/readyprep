import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { getSkipTake } from 'util/pagination.util';
import { EntityManager } from 'typeorm';
import { Pack } from '../ingredients/pack.entity';
import { PantryIngredient } from '../ingredients/pantry-ingredient.entity';
import { InventoryLog, LogType } from '../inventory/log.entity';
import { LocationsService } from '@app/locations/locations.service';
import { Pagination } from '../pagination/interface/pagination.interface';
import { UnitsService } from '../units/units.service';
import { VendorOrder } from '../vendors/entities';
import { UpdateInvoiceRequestDTO } from './dto';
import { CreateInvoiceRequestDTO } from './dto/create-invoice.dto';
import { Invoice, InvoiceItem } from './entities';
import { Transactional } from '@modules/infra/database/transactional.decorator';
import { VendorOrderState } from '../vendors/enum/order-state.enum';
import { Account } from '../accounts/account.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectEntityManager() private readonly manager: EntityManager,
    private readonly unitsService: UnitsService,
    private readonly locationsService: LocationsService,
  ) {}

  @Transactional()
  public async find({ page, pageSize }: Pagination, accountId: Account['id']) {
    const manager = Transactional.getManager();
    const location = await this.locationsService.getLocation(accountId);

    const { skip, take } = getSkipTake(page, pageSize);
    const [invoices, count] = await manager.findAndCount(Invoice, {
      skip,
      take,
      where: {
        location,
      },
      order: {
        date: 'DESC',
      },
      relations: ['vendor'],
    });
    return {
      invoices,
      numPages: Math.ceil(count / pageSize),
    };
  }

  public async findOne(
    id: Invoice['id'],
    manager: EntityManager = this.manager,
  ) {
    return await manager.getRepository(Invoice).findOne(id, {
      relations: [
        'vendor',
        'items',
        'items.pack',
        'items.pack.pantryIngredient',
      ],
    });
  }

  public async create(
    data: CreateInvoiceRequestDTO & { id?: string },
    accountId: Account['id'],
    manager: EntityManager = this.manager,
  ): Promise<Invoice['id']> {
    const invoice = new Invoice();

    const location = await this.locationsService.getLocation(accountId);

    if (data.id) invoice.id = data.id;

    invoice.vendorId = data.vendorId;
    invoice.number = data.number;

    invoice.location = location;

    const date = new Date(`${data.date}Z`);
    invoice.date = date;

    const updateCatalogPrices = data.updateCatalogPrices;

    const items = [];
    for (const item of data.items) {
      const invoiceItem = new InvoiceItem();
      invoiceItem.numPacks = item.packs;

      const pantryIngredient = await manager.findOne(PantryIngredient, {
        where: {
          ownerId: accountId,
          scopedId: item.ingredientId,
        },
        relations: ['standardUOM'],
      });

      const pack = await manager.findOne(Pack, {
        where: {
          pantryIngredient,
          catalogNumber: item.catalogNumber,
        },
        relations: ['itemUnit'],
      });

      invoiceItem.pack = pack;

      invoiceItem.pricePaid = item.paid ?? item.packs * +pack.price;

      if (invoiceItem.pack === null) {
        throw new NotFoundException('Vendor Item does not exist');
      }

      if (item.paid && updateCatalogPrices) {
        pack.price = (item.paid / item.packs).toFixed(2);
        await manager.save(pack);
      }

      const value = await this.unitsService.convert(
        {
          amount: invoiceItem.numPacks * +pack.numItems * +pack.amountPerItem,
          ingredient: pantryIngredient,
        },
        pack.itemUnit,
        pantryIngredient.standardUOM,
        manager,
      );

      invoiceItem.inventoryLog = new InventoryLog({
        location,
        time: invoice.date,
        type: LogType.RELATIVE,
        value: value ?? 0,
        ingredient: pantryIngredient,
      });

      items.push(invoiceItem);
    }

    invoice.items = items;
    invoice.totalPaid = items.reduce((sum, item) => sum + +item.pricePaid, 0);

    await manager.save(invoice);

    if (data.orderId) {
      await manager.update(
        VendorOrder,
        {
          id: data.orderId,
          location,
        },
        {
          invoice,
          state: VendorOrderState.RECEIVED,
        },
      );
    }
    return invoice.id;
  }

  public async update(
    id: Invoice['id'],
    data: UpdateInvoiceRequestDTO,
    accountId: Account['id'],
    manager: EntityManager = this.manager,
  ): Promise<void> {
    const invoice = await manager.findOne(Invoice, id, {
      relations: ['location'],
    });

    if (invoice.location.accountId !== accountId) throw new NotFoundException();

    await manager.delete(Invoice, id);
    await this.create({ ...data, id }, accountId, manager);
  }
}
