import { IsNumber, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Ingredient } from '../../ingredients/ingredient.entity';

export class AddRecipeIngredientRequest {
  @IsNotEmpty()
  readonly id: Ingredient['id'];

  @IsNumber()
  readonly amount: number;

  @IsString()
  readonly unitSymbol: string;

  @IsNumber()
  @IsOptional()
  readonly yieldPercent?: number;
}

export class AddRecipeIngredientResponse {}
