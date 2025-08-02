import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { Ingredient } from '../ingredients/ingredient.entity';
import { LocationModel } from '../../app/locations/infra/models/location.model';
import { OrderItem } from '../pos/order-item.entity';

export enum LogType {
  'ABSOLUTE' = 'ABSOLUTE',
  'CACHE' = 'CACHE',
  'RELATIVE' = 'RELATIVE',
  'SCALE' = 'SCALE',
}

@Entity()
@Index(['locationId', 'ingredientId', 'time', 'type'])
export class InventoryLog {
  constructor(inventoryLog?: Partial<InventoryLog>) {
    Object.assign(this, inventoryLog);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  time: Date;

  @ManyToOne(() => LocationModel, { onDelete: 'CASCADE' })
  location: LocationModel;

  @Column()
  locationId: LocationModel['id'];

  @ManyToOne(() => Ingredient, { onDelete: 'CASCADE' })
  ingredient: Ingredient;

  @Column()
  ingredientId: Ingredient['id'];

  @Column()
  type: LogType;

  @Column('decimal', { precision: 20, scale: 10 })
  value: number;

  @ManyToOne(() => OrderItem, (orderItem) => orderItem.inventoryLogs, {
    nullable: true,
  })
  orderItem: OrderItem;
}
