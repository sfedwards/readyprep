import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateUnitRequest {
  @IsString()
  @IsOptional()
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

export class UpdateUnitResponse {}
