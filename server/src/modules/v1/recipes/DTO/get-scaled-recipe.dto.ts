import { Type } from 'class-transformer';
import { IsNumber, IsString, Min, ValidateNested } from 'class-validator';

class RecipeBatch {
  @IsString()
  recipeId: string;

  @IsNumber()
  @Min(0)
  batches: number;
}

export class GetScaledRecipesRequestDTO {
  @IsString()
  date: string;

  @ValidateNested()
  @Type(() => RecipeBatch)
  recipes: RecipeBatch[];
}
