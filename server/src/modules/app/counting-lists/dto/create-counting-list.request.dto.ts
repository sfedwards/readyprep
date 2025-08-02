import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';

export class CreateCountingListRequestDto {
  @IsString()
  name: string;

  @ValidateNested()
  @IsArray()
  ingredients: CountingIngredient[];
}

class CountingIngredient {
  @IsNumber()
  id: number;

  @IsString()
  unit: string;
}
