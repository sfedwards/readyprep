import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  DeleteDateColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Recipe } from './recipe.entity';
import { Ingredient } from '../ingredients/ingredient.entity';
import { Unit } from '../units/unit.entity';

@Entity()
export class RecipeIngredient {
  constructor(recipeIngredient?: Partial<RecipeIngredient>) {
    Object.assign(this, recipeIngredient);
  }

  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  scopedId: number;

  @ManyToOne(() => Recipe, (recipe) => recipe.ingredients, {
    onDelete: 'CASCADE',
  })
  recipe: Recipe;

  @Column()
  recipeId: Recipe['id'];

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.recipes, {
    onDelete: 'CASCADE',
  })
  ingredient: Ingredient;

  @Column()
  ingredientId: Ingredient['id'];

  @Column({ nullable: true })
  modifier: string;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 3,
    nullable: false,
  })
  amount: string;

  @ManyToOne(() => Unit, { nullable: false })
  unit: Unit;

  @Column()
  unitId: Unit['id'];

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    nullable: true,
  })
  yieldPercent: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
