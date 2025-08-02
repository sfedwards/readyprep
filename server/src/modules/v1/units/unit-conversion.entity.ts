import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  DeleteDateColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Ingredient } from '../ingredients/ingredient.entity';
import { Unit } from './unit.entity';

@Entity()
export class UnitConversion {
  constructor(unitConversion: Partial<UnitConversion> = {}) {
    Object.assign(this, unitConversion);
  }

  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.unitConversions, {
    onDelete: 'CASCADE',
  })
  ingredient: Ingredient;

  @Column()
  ingredientId: Ingredient['id'];

  @Column()
  scopedId: number;

  @Column({
    type: 'decimal',
    precision: 16,
    scale: 4,
  })
  amountA: string;

  @ManyToOne(() => Unit, { onDelete: 'CASCADE' })
  unitA: Unit;

  @Column({
    type: 'decimal',
    precision: 16,
    scale: 4,
  })
  amountB: string;

  @ManyToOne(() => Unit, { onDelete: 'CASCADE' })
  unitB: Unit;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
