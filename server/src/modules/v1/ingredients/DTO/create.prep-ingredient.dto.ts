import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  ArrayMaxSize,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PrepIngredient } from '../prep-ingredient.entity';
import { PrepRecipe } from '@modules/v1/recipes/prep-recipe.entity';
import { Conversion } from './conversion.dto';

class Ingredient {
  @IsNumber()
  readonly id: number;

  @IsNumber()
  readonly amount: number;

  @IsString()
  readonly unit: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(99.99)
  readonly waste: number;
}

export class CreatePrepIngredientRequest {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsNumber()
  @IsOptional()
  readonly batchSize: PrepRecipe['batchSize'];

  @IsString()
  @IsOptional()
  readonly batchUnit: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(99.99)
  readonly waste: number;

  @IsNumber()
  @IsOptional()
  readonly shelfLife: number;

  @IsString()
  @IsOptional()
  readonly instructions: string;

  @IsArray()
  @IsOptional()
  @ArrayMaxSize(20)
  @ValidateNested()
  @Type(() => Conversion)
  conversions?: Conversion[] = [];

  @IsArray()
  @IsOptional()
  @ArrayMaxSize(100)
  @ValidateNested()
  @Type(() => Ingredient)
  readonly ingredients: Ingredient[] = [];
}

export class CreatePrepIngredientResponse {
  constructor(prepIngredient: PrepIngredient) {
    const { scopedId, name } = prepIngredient;

    Object.assign(this, {
      id: scopedId,
      name,
    });
  }
}
