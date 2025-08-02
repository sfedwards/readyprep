import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { Order } from '../order.entity';

@Entity()
export class CloverOrder {
  constructor(cloverOrder?: Partial<CloverOrder>) {
    Object.assign(this, cloverOrder);
  }

  @PrimaryColumn()
  id: string;

  @OneToOne(() => Order, { onDelete: 'CASCADE' })
  order: Order;

  @Column({ type: 'text' })
  orderId: Order['id'];
}
