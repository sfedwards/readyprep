import { ChildEntity, Column, OneToOne, ManyToOne } from 'typeorm';
import { Recipe } from './recipe.entity';
import { PrepIngredient } from '../ingredients/prep-ingredient.entity';
import { Unit } from '../units/unit.entity';

@ChildEntity()
export class PrepRecipe extends Recipe {
  constructor(recipe?: Partial<PrepRecipe>) {
    super(recipe);
  }

  @OneToOne(() => PrepIngredient, (ingredient) => ingredient.recipe, {
    onDelete: 'CASCADE',
  })
  prepIngredient: PrepIngredient;

  @Column({
    type: 'decimal',
    precision: 7,
    scale: 3,
    nullable: true,
  })
  batchSize: string;

  @ManyToOne(() => Unit)
  batchUnit: Unit;

  @Column()
  instructions: string;
}
