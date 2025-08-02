import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  ManyToMany,
} from 'typeorm';
import { Order } from './order.entity';
import { MenuItem } from '../menu-items/menu-item.entity';
import { InventoryLog } from '../inventory/log.entity';

@Entity()
export class OrderItem {
  constructor(orderItem?: Partial<OrderItem>) {
    Object.assign(this, orderItem);
  }

  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  order: Order;

  @Column()
  orderId: Order['id'];

  @ManyToOne(() => MenuItem, { nullable: true })
  item: MenuItem;

  @Column({ nullable: true })
  itemId: MenuItem['id'];

  @Column()
  quantity: number;

  @ManyToMany(() => InventoryLog, (log) => log.orderItem)
  inventoryLogs: InventoryLog[];
}
