import { IsNumber } from 'class-validator';

export class UpdateCountRequestDto {
  @IsNumber()
  ingredientId: number;

  @IsNumber()
  actualQuantity: number;
}
