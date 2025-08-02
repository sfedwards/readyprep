import { AccountId } from '@domain/account';
import { IngredientQueries, IngredientScopedId } from '@domain/ingredients';
import { IngredientDto } from '@domain/ingredients/interface/dto/ingredient.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class IngredientsService {
  public constructor(private readonly ingredientQueries: IngredientQueries) {}

  public async getIngredient(
    accountId: AccountId,
    ingredientId: IngredientScopedId,
  ): Promise<IngredientDto> {
    return await this.ingredientQueries.ingredientByScopedId(
      accountId,
      ingredientId,
    );
  }
}
