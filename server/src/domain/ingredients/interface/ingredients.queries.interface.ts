import { AccountId } from '@domain/account';
import { LocationId } from '@domain/location';
import { IngredientScopedId } from '../ingredient-scoped-id';
import { IngredientDto } from './dto/ingredient.dto';

export abstract class IngredientQueries {
  abstract ingredientByScopedId(
    accountId: AccountId,
    ingredientId: IngredientScopedId,
  ): Promise<IngredientDto>;
  abstract getCountingListName(
    locationId: LocationId,
    ingredientId: IngredientScopedId,
  ): Promise<string>;
}
