import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Unit } from './unit.entity';

@Entity()
export class UnitAlias {
  constructor(unitSymbol: Partial<UnitAlias> = {}) {
    Object.assign(this, unitSymbol);
  }

  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => Unit, (unit) => unit.aliases, { onDelete: 'CASCADE' })
  unit: Unit;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
