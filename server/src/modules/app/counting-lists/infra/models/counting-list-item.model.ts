import { Ingredient } from '@modules/v1/ingredients/ingredient.entity';
import { Unit } from '@modules/v1/units/unit.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CountingListModel } from '.';

@Entity({
  name: 'counting_list_items',
})
export class CountingListItemModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CountingListModel, (countingList) => countingList.items, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  countingList: CountingListModel;

  @Column({ nullable: true })
  countingListId: CountingListModel['id'];

  @ManyToOne(() => Ingredient, {
    onDelete: 'CASCADE',
  })
  ingredient: Ingredient;

  @Column()
  ingredientId: Ingredient['id'];

  @Column()
  index: number;

  @ManyToOne(() => Unit)
  countingUnit: Unit;

  @Column()
  countingUnitId: Unit['id'];

  @CreateDateColumn()
  createdAt: Date;
}
