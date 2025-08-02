import { Conversion } from '@modules/v1/ingredients/DTO/conversion.dto';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UnitConversionUnitAmount {
  @IsString()
  unit: string;

  @IsNumber()
  amount: number;
}

export class UnitConversionUnit {
  @IsString()
  unit: string;
}

export class UnitConversionRequestDto {
  @ValidateNested()
  from: UnitConversionUnitAmount;

  @ValidateNested()
  @IsOptional()
  to?: UnitConversionUnit;

  @ValidateNested({ each: true })
  conversions?: Conversion[];
}
