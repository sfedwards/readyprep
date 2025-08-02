import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { SystemIngredient } from './system-ingredient.entity';
import { Unit } from '../../units/unit.entity';

@Entity()
export class SystemUnitConversion {
  constructor(systemUnitConversion: Partial<SystemUnitConversion> = {}) {
    Object.assign(this, systemUnitConversion);
  }

  @PrimaryGeneratedColumn('uuid')
  id: number;

  @OneToOne(() => SystemIngredient, (ingredient) => ingredient.fdcLink)
  @JoinColumn()
  systemIngredient: SystemIngredient;

  @Column()
  systemIngredientId: SystemIngredient['id'];

  @Column()
  grams: number;

  @ManyToOne(() => Unit)
  unit: Unit;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
