import { Ingredient } from '@modules/v1/ingredients/ingredient.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CountModel } from '.';

@Entity({
  name: 'count_items',
})
export class CountItemModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CountModel, (count) => count.items, { onDelete: 'CASCADE' })
  count: CountModel;

  @Column()
  countId: CountModel['id'];

  @ManyToOne(() => Ingredient, { onDelete: 'CASCADE' })
  ingredient: Ingredient;

  @Column()
  ingredientId: Ingredient['id'];

  @Column()
  theoreticalQuantity: number;

  @Column()
  actualQuantity: number;
}
