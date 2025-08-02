export interface Recipe {
  id: string,
  name: string,
  batchSize: number,
  batchUnit: string,
  include: boolean,
  batches: number,
}

export class PrintRecipesForm {
  recipes: Recipe[];

  constructor ( recipes: Recipe[] = [] ) {
    this.recipes = recipes;
  }
}
