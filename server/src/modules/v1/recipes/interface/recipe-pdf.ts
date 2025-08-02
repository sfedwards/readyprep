export type RecipesPdfDTO = {
  date: string;
  recipes: {
    name: string;
    batches: number;
    batchSize: number;
    batchUnit: string;
    instructions: string;
    ingredients: {
      name: string;
      amount: number;
      unit: string;
    }[];
  }[];
};
