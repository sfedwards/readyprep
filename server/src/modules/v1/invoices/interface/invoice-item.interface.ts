import { IsNumber, IsOptional, IsString } from 'class-validator';

import { Ingredient } from '@modules/v1/ingredients/ingredient.entity';

export class IInvoiceItem {
  @IsNumber()
  ingredientId: Ingredient['scopedId'];

  @IsString()
  catalogNumber: string;

  @IsNumber()
  packs: number;

  @IsNumber()
  @IsOptional()
  paid?: number;
}
