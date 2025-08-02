import { IsNumber, IsString } from 'class-validator';

export class Conversion {
  @IsNumber()
  amountA: number;

  @IsString()
  unitA: string;

  @IsNumber()
  amountB: number;

  @IsString()
  unitB: string;
}
