import { LocationId } from '@domain/location';
import { IngredientScopedId, IngredientQueries } from '@domain/ingredients';
import { Transactional } from '@modules/infra/database/transactional.decorator';
import { Injectable } from '@nestjs/common';
import { AccountId } from '@domain/account';
import { IngredientDto } from '@domain/ingredients/interface/dto/ingredient.dto';
import { Ingredient } from '@modules/v1/ingredients/ingredient.entity';
import { PantryIngredient } from '@modules/v1/ingredients/pantry-ingredient.entity';
import { PrepIngredient } from '@modules/v1/ingredients/prep-ingredient.entity';

@Injectable()
export class TypeormIngredientQueries implements IngredientQueries {
  @Transactional({ isolationLevel: 'READ COMMITTED' })
  public async ingredientByScopedId(
    accountId: AccountId,
    ingredientId: IngredientScopedId,
  ): Promise<IngredientDto> {
    const manager = Transactional.getManager();

    const ingredientModel = await manager.findOne(Ingredient, {
      where: {
        ownerId: accountId.toValue(),
        scopedId: ingredientId,
      },
      relations: [
        'standardUOM',
        'recipe',
        'recipe.batchUnit',
        'unitConversions',
        'unitConversions.unitA',
        'unitConversions.unitB',
      ],
    });

    const type =
      ingredientModel.type === 'PantryIngredient' ? 'pantry' : 'prep';
    const standardUnit =
      type === 'pantry'
        ? (ingredientModel as PantryIngredient).standardUOM.symbol
        : (ingredientModel as PrepIngredient).recipe.batchUnit.symbol;

    return {
      id: ingredientModel.scopedId,
      name: ingredientModel.name,
      type,
      standardUnit,
      unitConversions: [],
    };
  }

  @Transactional({ isolationLevel: 'READ COMMITTED' })
  public async getCountingListName(
    locationId: LocationId,
    scopedIngredientId: IngredientScopedId,
  ): Promise<string> {
    const manager = Transactional.getManager();

    return await manager.query(
      `
        SELECT list.name, item.unit.symbol 
        FROM
          counting_list_items item
        JOIN
          counting_list list
        JOIN
          ingredients ingredient
        JOIN
          units init
        ON 
          (
                     item."countingListId" = list.id
              AND    item."ingredientId" = ingredient.id
              AND    item."unitId" = unit.id
          )
        WHERE  list.id = ?
        AND    ingredient.scopedid = ?
      `,
      [locationId, scopedIngredientId],
    );
  }
}

export const IngredientQueriesProvider = {
  provide: IngredientQueries,
  useClass: TypeormIngredientQueries,
};
