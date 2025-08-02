import { CountDto, CountId, CountQueries } from '@domain/count';
import { CountSummaryDto } from '@domain/count';
import { LocationId } from '@domain/location';
import { Transactional } from '@modules/infra/database/transactional.decorator';
import { PantryIngredient } from '@modules/v1/ingredients/pantry-ingredient.entity';
import { PrepIngredient } from '@modules/v1/ingredients/prep-ingredient.entity';
import { Injectable } from '@nestjs/common';
import { pick } from 'lodash';
import { CountModel } from './models';

@Injectable()
export class TypeormCountQueries implements CountQueries {
  public async getCountById(id: CountId): Promise<CountDto> {
    const count = await Transactional.getManager().findOne(CountModel, {
      where: {
        id: id.toString(),
      },
      relations: [
        'items',
        'items.ingredient',
        'items.ingredient.standardUOM',
        'items.ingredient.recipe',
        'items.ingredient.recipe.batchUnit',
      ],
    });

    const date = `${count.date.getUTCFullYear()}-${
      count.date.getUTCMonth() + 1
    }-${count.date.getUTCDate()}`;

    return {
      date,
      countingListId: count.countingListId,
      items: count.items.map((item) => {
        const { ingredient } = item;
        const unit =
          ingredient.type === PantryIngredient.name
            ? (ingredient as PantryIngredient).standardUOM?.symbol
            : (ingredient as PrepIngredient).recipe.batchUnit?.symbol;

        return {
          ingredient: {
            id: ingredient.scopedId,
            name: ingredient.name,
          },
          ...pick(item, ['theoreticalQuantity', 'actualQuantity']),
          unit,
        };
      }),
    };
  }

  public async getCountsByLocation(
    locationId: LocationId,
  ): Promise<CountSummaryDto[]> {
    const counts = await Transactional.getManager().find(CountModel, {
      where: {
        locationId,
      },
    });

    return counts.map(({ id, date }) => ({
      id,
      date,
      theoreticalValue: 0,
      variance: 0,
    }));
  }
}

export const CountQueriesProvider = {
  provide: CountQueries,
  useClass: TypeormCountQueries,
};
