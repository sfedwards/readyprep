import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class GetIngredientCostRequest {
  @IsNumber()
  amount: number;

  @IsString()
  unit: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(99.9)
  waste = 0;
}

export class GetIngredientCostResponse extends Number {
  constructor(cost: number) {
    super(cost);
  }
}
