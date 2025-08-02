import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Unit } from '../unit.entity';

export class CreateUnitRequest {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  readonly symbol: string;

  @IsNumber()
  @IsOptional()
  readonly amount: number;

  @IsString()
  @IsOptional()
  readonly unit: string;
}

export class CreateUnitResponse {
  constructor(unit: Unit) {
    const { scopedId, name } = unit;

    Object.assign(this, {
      id: scopedId,
      name,
    });
  }
}
