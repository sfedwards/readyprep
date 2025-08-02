import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { SystemIngredient } from './system-ingredient.entity';
import { Unit } from '../../units/unit.entity';

@Entity()
export class SystemNutrient {
  constructor(systemNutrient: Partial<SystemNutrient> = {}) {
    Object.assign(this, systemNutrient);
  }

  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => SystemIngredient, (ingredient) => ingredient.nutrients)
  systemIngredient: SystemIngredient;

  @Column()
  systemIngredientId: SystemIngredient['id'];

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
