import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ArrayMaxSize,
  ValidateNested,
  Min,
  Max,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { PantryIngredient } from '../pantry-ingredient.entity';
import { Type } from 'class-transformer';
import { Vendor } from '@modules/v1/vendors/entities';
import { Conversion } from './conversion.dto';

export class Pack {
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

export class CreatePantryIngredientRequest {
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
  @IsOptional()
  @ArrayMaxSize(1)
  @ValidateNested()
  @Type(() => Pack)
  packs: Pack[] = [];

  @IsArray()
  @IsOptional()
  @ArrayMaxSize(20)
  @ValidateNested()
  @Type(() => Conversion)
  conversions?: Conversion[] = [];
}

export class CreatePantryIngredientResponse {
  constructor(pantryIngredient: PantryIngredient) {
    const { scopedId, name } = pantryIngredient;

    Object.assign(this, {
      id: scopedId,
      name,
    });
  }
}
