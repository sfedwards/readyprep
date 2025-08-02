import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Account } from '../accounts/account.entity';
import { Pack } from '../ingredients/pack.entity';
import { PantryIngredient } from '../ingredients/pantry-ingredient.entity';
import { UnitsService } from '../units/units.service';
import { CreateVendorItemRequestDTO, UpdateVendorItemRequestDTO } from './dto';

@Injectable()
export class VendorItemsService {
  constructor(
    @InjectEntityManager() private readonly manager: EntityManager,
    private readonly unitsService: UnitsService,
  ) {}

  public async findOne(id: Pack['id'], manager: EntityManager = this.manager) {
    // TODO: Make sure that only vendorItem items owned by account can be fetched
    return await manager.findOne(Pack, id, {
      relations: [
        'itemUnit',
        'pantryIngredient',
        'pantryIngredient.unitConversions',
      ],
    });
  }

  public async create(
    accountId: Account['id'],
    data: CreateVendorItemRequestDTO,
    manager: EntityManager = this.manager,
  ): Promise<Pack['id']> {
    const vendorItem = new Pack();

    const { catalogNumber, price, numItems, amountPerItem, unit } = data;

    console.log( data );

    Object.assign(vendorItem, {
      catalogNumber,
      price,
      numItems,
      amountPerItem,
    });

    vendorItem.itemUnit = await this.unitsService.findByAlias({
      ownerId: accountId,
      alias: unit,
    });

    await manager.save(vendorItem);
    return vendorItem.id;
  }

  public async update(
    accountId: Account['id'],
    id: Pack['id'],
    data: UpdateVendorItemRequestDTO,
    manager: EntityManager = this.manager,
  ): Promise<void> {
    const vendorItem = await manager.findOne(Pack, id, {
      relations: ['pantryIngredient', 'pantryIngredient.unitConversions'],
    });

    // TODO: if vendorItem.ownerId !== accountId, prevent access

    const {
      catalogNumber,
      price,
      numItems,
      amountPerItem,
      unit,
      pantryIngredientId,
    } = data;

    Object.assign(vendorItem, {
      catalogNumber,
      price,
      numItems,
      amountPerItem,
    });

    vendorItem.pantryIngredient = await this.manager.findOne(PantryIngredient, {
      where: {
        ownerId: accountId,
        scopedId: pantryIngredientId,
      },
    });

    vendorItem.itemUnit = await this.unitsService.findByAlias({
      ownerId: accountId,
      alias: unit,
    });

    await manager.save(vendorItem);
  }
}
