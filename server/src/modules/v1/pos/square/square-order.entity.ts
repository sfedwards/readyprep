import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { Order } from '../order.entity';

@Entity()
export class SquareOrder {
  constructor(squareOrder?: Partial<SquareOrder>) {
    Object.assign(this, squareOrder);
  }

  @PrimaryColumn()
  id: string;

  @OneToOne(() => Order, { onDelete: 'CASCADE' })
  order: Order;

  @Column({ type: 'text' })
  orderId: Order['id'];
}
