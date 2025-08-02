import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsArray,
  ArrayMaxSize,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MenuItem } from '../menu-item.entity';

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

export class CreateMenuItemRequest {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsNumber()
  @IsOptional()
  readonly price: number = null;

  @IsNumber()
  @IsOptional()
  readonly averageWeeklySales: number = null;

  @IsString()
  @IsOptional()
  readonly instructions: string;

  @ValidateNested()
  @IsArray()
  @ArrayMaxSize(100)
  @Type(() => Ingredient)
  readonly ingredients: Ingredient[];
}

export class CreateMenuItemResponse {
  constructor(menuItem: MenuItem) {
    const { scopedId } = menuItem;

    Object.assign(this, {
      id: scopedId,
    });
  }
}
