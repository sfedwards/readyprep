import { IsOptional } from 'class-validator';

import { toNumberOrNull } from '../../../../util/Util';
import { PaginatedRequest } from '../../pagination/DTO/pagination.dto';
import { PantryIngredient } from '../pantry-ingredient.entity';

export class FindPantryIngredientsRequest extends PaginatedRequest {
  @IsOptional()
  search: string;
}

export class FindPantryIngredientsResponse {
  private readonly pantryIngredients: {
    name: string;
  }[];

  constructor(
    pantryIngredients: PantryIngredient[],
    parLevels: number[],
    private readonly numPages: number,
  ) {
    this.pantryIngredients = pantryIngredients.map((pantryIngredient, i) => {
      const { name, scopedId, defaultPack: pack } = pantryIngredient;

      const {
        price: pricePerPack,
        numItems: itemsPerPack,
        amountPerItem,
        itemUnit,
      } = pack ?? {};

      const uom = {
        name: itemUnit?.name,
        symbol: itemUnit?.symbol,
      };

      return {
        id: scopedId,
        name,
        pricePerPack: toNumberOrNull(pricePerPack),
        itemsPerPack: toNumberOrNull(itemsPerPack),
        amountPerItem: toNumberOrNull(amountPerItem),
        uom,
        parLevel: toNumberOrNull(parLevels[i]),
      };
    });
  }
}
