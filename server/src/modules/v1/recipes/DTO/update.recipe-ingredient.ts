import { IsNumber, IsOptional } from 'class-validator';

export class UpdateRecipeIngredientRequest {
  @IsNumber()
  @IsOptional()
  readonly amount: number;

  @IsNumber()
  @IsOptional()
  readonly unitId: number;

  @IsNumber()
  @IsOptional()
  readonly yieldPercent: number;
}

export class UpdateRecipeIngredientResponse {}
