import { Ingredient } from './Ingredient';

export interface RecipeIngredient {
  key: string;
  ingredient?: Ingredient;
  amount?: string;
  unit?: string;
  waste?: string;
  cost?: number;
}
