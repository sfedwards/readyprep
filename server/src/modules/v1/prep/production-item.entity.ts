import {
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  VersionColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { PrepIngredient } from '../ingredients/prep-ingredient.entity';
import { Production } from './production.entity';
import { InventoryLog } from '../inventory/log.entity';

@Entity()
export class ProductionItem {
  constructor(productionItem?: Partial<ProductionItem>) {
    Object.assign(this, productionItem);
  }

  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => Production, (production) => production.items, {
    onDelete: 'CASCADE',
  })
  production: Production;

  @Column()
  productionId: Production['id'];

  @ManyToOne(() => PrepIngredient, { onDelete: 'CASCADE' })
  prepIngredient: PrepIngredient;

  @Column()
  prepIngredientId: PrepIngredient['id'];

  @OneToOne(() => InventoryLog, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  actualInventory: InventoryLog;

  @Column({ nullable: true })
  actualInventoryId: InventoryLog['id'];

  @OneToOne(() => InventoryLog, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  actualPrep: InventoryLog;

  @Column()
  actualPrepId: InventoryLog['id'];

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;
}
