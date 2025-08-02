import { IsOptional } from 'class-validator';

import { toNumberOrNull } from '../../../../util/Util';
import { PaginatedRequest } from '../../pagination/DTO/pagination.dto';
import { PrepIngredient } from '../prep-ingredient.entity';

export class FindPrepIngredientsRequest extends PaginatedRequest {
  @IsOptional()
  search: string;
}

export class FindPrepIngredientsResponse {
  private readonly prepIngredients: {
    name: string;
  }[];

  constructor(
    prepIngredients: PrepIngredient[],
    costs: number[],
    parLevels: number[],
    private readonly numPages: number,
  ) {
    this.prepIngredients = prepIngredients.map((prepIngredient, i) => {
      const { scopedId, name, recipe } = prepIngredient;

      const { batchSize, batchUnit } = recipe;

      return {
        id: scopedId,
        name,
        cost: costs[i],
        batchSize: toNumberOrNull(batchSize),
        batchUnit: batchUnit?.symbol,
        parLevel: parLevels[i],
      };
    });
  }
}
