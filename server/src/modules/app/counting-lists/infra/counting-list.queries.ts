import { CountingListId, CountingListQueries } from '@domain/counting-list';
import {
  CountingListDto,
  CountingListSummaryDto,
} from '@domain/counting-list/interfaces/dto';
import { IngredientScopedId } from '@domain/ingredients';
import { LocationId } from '@domain/location';
import { LocationModel } from '@modules/app/locations/infra/models';
import { Transactional } from '@modules/infra/database/transactional.decorator';
import { Ingredient } from '@modules/v1/ingredients/ingredient.entity';
import { Injectable } from '@nestjs/common';
import { pick } from 'lodash';
import { CountingListItemModel, CountingListModel } from './models';

@Injectable()
export class TypeormCountingListQueries implements CountingListQueries {
  @Transactional({ isolationLevel: 'READ COMMITTED' })
  public async getListSummaryForIngredient(
    locationId: LocationId,
    ingredientId: IngredientScopedId,
  ): Promise<{ list: CountingListSummaryDto; unit: string }> {
    const manager = Transactional.getManager();

    const location = await manager.findOne(LocationModel, locationId.toValue());
    if (!location) return null;

    const ingredient = await manager.findOne(Ingredient, {
      where: {
        ownerId: location.accountId,
        scopedId: ingredientId.toString(),
      },
    });
    if (!ingredient) return null;

    const listItem = await manager.findOne(CountingListItemModel, {
      where: {
        ingredientId: ingredient.id,
      },
      relations: ['countingList', 'countingUnit'],
    });
    if (!listItem) return null;

    return {
      list: pick(listItem.countingList, ['id', 'name', 'isDefault']),
      unit: listItem.countingUnit.symbol,
    };
  }

  @Transactional({ isolationLevel: 'READ COMMITTED' })
  public async getCountingListById(
    id: CountingListId,
  ): Promise<CountingListDto> {
    const countingList = await Transactional.getManager().findOne(
      CountingListModel,
      {
        where: {
          id: id.toString(),
        },
        relations: ['items', 'items.ingredient', 'items.countingUnit'],
      },
    );

    return {
      id: countingList.id,
      name: countingList.name,
      isDefault: countingList.isDefault,
      items: countingList.items.map((item) => {
        const { ingredient, countingUnit } = item;
        const unit = countingUnit?.symbol;

        return {
          ingredient: {
            id: ingredient.scopedId,
            name: ingredient.name,
            type: ingredient.type === 'PantryIngredient' ? 'pantry' : 'prep',
          },
          unit,
        };
      }),
    };
  }

  @Transactional({ isolationLevel: 'READ COMMITTED' })
  public async getCountingListsByLocation(
    locationId: LocationId,
  ): Promise<CountingListSummaryDto[]> {
    const countingLists = await Transactional.getManager().find(
      CountingListModel,
      {
        where: {
          locationId,
        },
        order: {
          createdAt: 'ASC',
        },
      },
    );

    return countingLists.map(({ id, name, isDefault }) => ({
      id,
      name,
      isDefault,
    }));
  }
}

export const CountingListQueriesProvider = {
  provide: CountingListQueries,
  useClass: TypeormCountingListQueries,
};
