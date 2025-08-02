import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Ingredient } from './ingredient.entity';
import { Unit } from '../units/unit.entity';

@Entity()
export class Nutrient {
  constructor(nutrient: Partial<Nutrient> = {}) {
    Object.assign(this, nutrient);
  }

  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.nutrients)
  ingredient: Ingredient;

  @Column()
  ingredientId: Ingredient['id'];

  @Column()
  name: string;

  @Column()
  amount: number;

  @ManyToOne(() => Unit)
  unit: Unit;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
