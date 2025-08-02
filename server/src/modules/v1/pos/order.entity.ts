import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { LocationModel } from '../../app/locations/infra/models/location.model';
import { OrderItem } from './order-item.entity';

@Entity()
export class Order {
  constructor(order?: Partial<Order>) {
    Object.assign(this, order);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LocationModel, { onDelete: 'CASCADE' })
  location: LocationModel;

  @Column()
  locationId: LocationModel['id'];

  @ManyToOne(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];
}
