import { ChildEntity, Column, OneToOne } from 'typeorm';
import { MenuItem } from '../menu-items/menu-item.entity';
import { Recipe } from './recipe.entity';

@ChildEntity()
export class PlatingRecipe extends Recipe {
  constructor(recipe: Partial<PlatingRecipe>) {
    super(recipe);
  }

  @OneToOne(() => MenuItem, (item) => item.recipe)
  menuItem: MenuItem;

  @Column()
  name: string;
}
