import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { InventoryLog } from '../inventory/log.entity';
import { OrderItem } from './order-item.entity';

@Entity()
export class OrderItemInventory {
  constructor(orderItemInventory?: Partial<OrderItemInventory>) {
    Object.assign(this, orderItemInventory);
  }

  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => OrderItem, (orderItem) => orderItem.inventoryLogs, {
    onDelete: 'CASCADE',
  })
  orderItem: OrderItem;

  @Column()
  orderItemId: OrderItem['id'];

  @ManyToOne(() => InventoryLog, (log) => log.orderItem, {
    onDelete: 'CASCADE',
  })
  inventoryLog: InventoryLog;

  @Column()
  inventoryLogId: InventoryLog['id'];
}
