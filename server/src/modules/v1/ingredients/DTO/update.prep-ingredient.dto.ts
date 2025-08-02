import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsArray,
  ArrayMaxSize,
  ValidateNested,
} from 'class-validator';
import { PrepRecipe } from '@modules/v1/recipes/prep-recipe.entity';
import { Type } from 'class-transformer';

class Conversion {
  @IsNumber()
  amountA: number;

  @IsString()
  unitA: string;

  @IsNumber()
  amountB: number;

  @IsString()
  unitB: string;
}

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

export class UpdatePrepIngredientRequest {
  @IsString()
  @IsOptional()
  readonly name: string;

  @IsNumber()
  @IsOptional()
  readonly batchSize: PrepRecipe['batchSize'];

  @IsString()
  @IsOptional()
  readonly batchUnit: string;

  @IsNumber()
  @IsOptional()
  readonly shelfLife: number;

  @IsNumber()
  @IsOptional()
  readonly prepFrequency: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(99.99)
  readonly waste: number;

  @IsString()
  @IsOptional()
  readonly instructions: string;

  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested()
  @Type(() => Conversion)
  conversions: Conversion[];

  @ValidateNested()
  @IsArray()
  @ArrayMaxSize(100)
  @Type(() => Ingredient)
  readonly ingredients: Ingredient[];
}

export class UpdatePrepIngredientResponse {}
