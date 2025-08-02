import { LocationId } from '@domain/location';
import { LocationModel } from '@modules/app/locations/infra/models';
import { Transactional } from '@modules/infra/database/transactional.decorator';
import { Ingredient } from '@modules/v1/ingredients/ingredient.entity';
import { PantryIngredient } from '@modules/v1/ingredients/pantry-ingredient.entity';
import { Injectable } from '@nestjs/common';
import { CountingListItemModel, CountingListModel } from '../../infra/models';

@Injectable()
export class PopulateCountingListsJob {
  @Transactional()
  public async run(locationId: LocationId): Promise<void> {
    const manager = Transactional.getManager();

    const location = await manager.findOne(
      LocationModel,
      locationId.toValue(),
      {
        relations: ['countingLists', 'countingLists.items'],
      },
    );
    if (!location) return null;

    const countingLists = location.countingLists;

    let defaultList = countingLists.find(({ isDefault }) => isDefault);

    // If there is no default list for this location yet, create one
    if (!defaultList) {
      await manager.insert(CountingListModel, {
        locationId: location.id,
        isDefault: true,
        name: 'Other Ingredients',
      });

      defaultList = await manager.findOne(CountingListModel, {
        where: {
          locationId: location.id,
          isDefault: true,
        },
        relations: ['items'],
      });

      countingLists.push(defaultList);
    }

    const ingredients = await manager.find(Ingredient, {
      where: {
        ownerId: location.accountId,
      },
    });

    let index = defaultList.items.length;

    for (const ingredient of ingredients) {
      const items = countingLists
        .map((list) =>
          list.items.find(
            (item: CountingListItemModel) =>
              item.ingredientId === ingredient.id,
          ),
        )
        .filter(Boolean);

      if (items.length >= 2) {
        items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        items.splice(0, 1);
        await manager.remove(items);
      }

      if (items.length === 0 && ingredient.type === 'PantryIngredient') {
        await manager.insert(CountingListItemModel, {
          countingListId: defaultList.id,
          ingredientId: ingredient.id,
          index: index++,
          countingUnitId: (ingredient as PantryIngredient).standardUOMId,
        });
      }
    }
  }
}
