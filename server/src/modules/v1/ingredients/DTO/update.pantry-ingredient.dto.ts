import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';
import { Vendor } from '@modules/v1/vendors/entities';

export class PackDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  vendorId?: Vendor['id'];

  @IsString()
  @IsOptional()
  catalogNumber?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  numItems? = 1;

  @IsNumber()
  @IsOptional()
  amountPerItem? = 1;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

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

export class UpdatePantryIngredientRequest {
  @IsString()
  @IsOptional()
  readonly name?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(99.99)
  waste?: number;

  @IsNumber()
  @IsOptional()
  orderFrequency?: number;

  @IsArray()
  @ValidateNested()
  @Type(() => PackDto)
  packs: PackDto[];

  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested()
  @Type(() => Conversion)
  conversions: Conversion[];

  @IsString()
  @IsOptional()
  unit: string;
}

export class UpdatePantryIngredientResponse {}
