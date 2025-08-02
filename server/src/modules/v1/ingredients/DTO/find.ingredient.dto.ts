import { Ingredient } from '../ingredient.entity';
import { IsString, IsOptional } from 'class-validator';
import { PantryIngredient } from '../pantry-ingredient.entity';

export class FindIngredientsRequest {
  @IsString()
  @IsOptional()
  query?: string;
}

export class FindIngredientsResponse extends Array<IngredientResponseRow> {
  constructor(ingredients: Ingredient[]) {
    super();

    Object.assign(
      this,
      ingredients.map((ingredient) => {
        const { scopedId, type, name } = ingredient;
        return {
          id: scopedId,
          type: type === PantryIngredient.name ? 'pantry' : 'prep',
          name,
        };
      }),
    );
  }
}

interface IngredientResponseRow {
  id: Ingredient['scopedId'];
  name: Ingredient['name'];
}
