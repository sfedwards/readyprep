import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

import { Invoice } from '../../invoices/entities/invoice.entity';
import { LocationModel } from '../../../app/locations/infra/models/location.model';
import { Vendor } from '.';
import { VendorOrderItem } from './order-item.entity';
import { User } from '@modules/v1/users/user.entity';
import { VendorOrderState } from '../enum/order-state.enum';

@Entity()
@Unique('unique_shortId', ['shortId'])
export class VendorOrder {
  constructor(order?: Partial<VendorOrder>) {
    Object.assign(this, order);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  shortId: string;

  @Column()
  key: string;

  @Column({ type: 'enum', enum: VendorOrderState })
  state: VendorOrderState;

  @ManyToOne(() => LocationModel, { onDelete: 'CASCADE', nullable: true })
  location: LocationModel;

  @Column({ nullable: true })
  locationId: LocationModel['id'];

  @ManyToOne(() => Vendor)
  vendor: Vendor;

  @Column()
  vendorId: Vendor['id'];

  @ManyToOne(() => Invoice, { nullable: true, onDelete: 'SET NULL' })
  invoice: Invoice;

  @Column({ nullable: true })
  invoiceId: Invoice['id'];

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    default: 0,
  })
  cost: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  creator: User;

  @Column()
  creatorId: User['id'];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;

  @OneToMany(() => VendorOrderItem, (item) => item.order, { cascade: true })
  items: Partial<VendorOrderItem>[];
}
