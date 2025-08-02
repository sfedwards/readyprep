import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

import { Pack } from '../../ingredients/pack.entity';
import { VendorOrder } from './order.entity';

@Entity()
export class VendorOrderItem {
  constructor(order?: Partial<VendorOrderItem>) {
    Object.assign(this, order);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => VendorOrder, { onDelete: 'CASCADE' })
  order: VendorOrder;

  @Column()
  orderId: VendorOrder['id'];

  @ManyToOne(() => Pack)
  pack: Pack;

  @Column()
  packId: Pack['id'];

  @Column()
  numPacks: number;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    default: 0,
  })
  pricePer: number;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;
}
