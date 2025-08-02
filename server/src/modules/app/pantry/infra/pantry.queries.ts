import { LocationId } from '@domain/location';
import { PantryQueries } from '@domain/pantry';
import { LocationModel } from '@modules/app/locations/infra/models';
import { Transactional } from '@modules/infra/database/transactional.decorator';
import { PantryIngredient } from '@modules/v1/ingredients/pantry-ingredient.entity';
import { InventoryService } from '@modules/v1/inventory/inventory.service';
import { Injectable } from '@nestjs/common';
import { pick } from 'lodash';

@Injectable()
export class TypeormPantryQueries implements PantryQueries {
  constructor(private readonly inventoryService: InventoryService) {}

  public async getInventory(locationId: LocationId) {
    const manager = Transactional.getManager();
    const location = await manager.findOne(LocationModel, `${locationId}`);

    const pantryIngredients = await manager.find(PantryIngredient, {
      where: {
        ownerId: location.accountId,
      },
      relations: ['standardUOM'],
    });

    return await Promise.all(
      pantryIngredients.map(async (ingredient) => {
        const inventory = await this.inventoryService.getInventory(
          location,
          ingredient,
        );

        return {
          ingredient: pick(ingredient, ['id', 'name']),
          quantity: inventory,
          unit: ingredient.standardUOM?.symbol,
        };
      }),
    );
  }
}

export const PantryQueriesProvider = {
  provide: PantryQueries,
  useClass: TypeormPantryQueries,
};
