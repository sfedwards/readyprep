import { ChildEntity, OneToOne, JoinColumn, Column } from 'typeorm';
import { Ingredient } from './ingredient.entity';
import { PrepRecipe } from '../recipes/prep-recipe.entity';

@ChildEntity()
export class PrepIngredient extends Ingredient {
  constructor(ingredient?: Partial<PrepIngredient>) {
    super(ingredient);
  }

  type = PrepIngredient.name;

  @OneToOne(() => PrepRecipe, (recipe) => recipe.prepIngredient)
  @JoinColumn()
  recipe: PrepRecipe;

  @Column()
  recipeId: PrepRecipe['id'];

  @Column()
  prepFrequency: number;

  @Column({ nullable: true })
  shelfLife: number;
}
