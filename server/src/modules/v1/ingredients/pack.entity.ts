import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { PantryIngredient } from './pantry-ingredient.entity';
import { Unit } from '../units/unit.entity';
import { Vendor } from '../vendors/entities';

@Entity()
export class Pack {
  constructor(pack?: Partial<Pack>) {
    Object.assign(this, pack);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Vendor, (vendor) => vendor.packs, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  vendor: Vendor;

  @Column({ nullable: true })
  vendorId: Vendor['id'];

  @Column({ default: '' })
  catalogNumber: string;

  @ManyToOne(
    () => PantryIngredient,
    (pantryIngredient) => pantryIngredient.packs,
    { onDelete: 'CASCADE' },
  )
  pantryIngredient: PantryIngredient;

  @Column()
  pantryIngredientId: PantryIngredient['id'];

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    default: 0,
    nullable: true,
  })
  price: string;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    default: 1,
    nullable: true,
  })
  numItems: string;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    default: 0,
    nullable: true,
  })
  amountPerItem: string;

  @ManyToOne(() => Unit, { nullable: true })
  itemUnit: Unit;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
