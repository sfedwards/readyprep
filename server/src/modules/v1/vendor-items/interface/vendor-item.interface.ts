import { IsNumber, IsOptional, IsString } from 'class-validator';

export class VendorItem {
  @IsString()
  @IsOptional()
  catalogNumber: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  numItems = 1;

  @IsNumber()
  @IsOptional()
  amountPerItem = 1;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsString()
  @IsOptional()
  pantryIngredientId: string;
}
