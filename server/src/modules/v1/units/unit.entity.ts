import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { UnitAlias } from './unit-alias.entity';
import { Account } from '../accounts/account.entity';

export enum UnitType {
  PURE = 'PURE',
  WEIGHT = 'WEIGHT',
  VOLUME = 'VOLUME',
}

@Entity()
@Index(['ownerId', 'scopedId'], { unique: true })
@Index(['ownerId', 'symbol'], { unique: true, where: '"deletedAt" IS NULL' })
@Index(['symbol'], { unique: true, where: '"ownerId" IS NULL' })
export class Unit {
  constructor(unit: Partial<Unit> = {}) {
    Object.assign(this, unit);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Owner is null for system ingredients
  @ManyToOne(() => Account, (owner) => owner.menus, { nullable: true })
  owner: Account;

  // Null indicates that this is a Core/System ingredient
  @Column({ nullable: true })
  ownerId: Account['id'];

  @Column({ nullable: true })
  scopedId: number;

  @Column({ nullable: true })
  name: string;

  @Column()
  symbol: string;

  // Definition of the unit in either: ml, mg, ct
  // Could be null for drafts or units that are only used locally
  @Column({ nullable: true })
  magnitude: number;

  // The unit that was used to define this unit,
  // only used when modifying the unit directly
  @ManyToOne(() => Unit, { nullable: true })
  definitionUnit: Unit;

  @OneToMany(() => UnitAlias, (symbol) => symbol.unit)
  aliases: UnitAlias[];

  @Column({
    type: 'enum',
    enum: UnitType,
    nullable: true,
  })
  type: UnitType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
