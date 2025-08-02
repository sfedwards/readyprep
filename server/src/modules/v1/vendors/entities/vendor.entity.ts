import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

import { LocationModel } from '../../../app/locations/infra/models/location.model';
import { Pack } from '../../ingredients/pack.entity';
import { VendorAddress } from './vendor-address.entity';
import { VendorContact } from './vendor-contact.entity';
import { VendorOrderMethod } from '../enum/order-method.enum';

@Entity()
export class Vendor {
  constructor(vendor?: Partial<Vendor>) {
    Object.assign(this, vendor);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LocationModel, { onDelete: 'CASCADE' })
  location: LocationModel;

  @Column()
  locationId: LocationModel['id'];

  @Column()
  name: string;

  @Column()
  accountNumber: string;

  @Column({ type: 'enum', enum: VendorOrderMethod })
  orderMethod: VendorOrderMethod;

  @Column({ default: false })
  includePricesOnPurchaseOrders: boolean;

  @OneToOne(() => VendorContact, (c) => c.vendor, { cascade: true })
  primaryContact: VendorContact;

  @OneToOne(() => VendorAddress, (a) => a.vendor, { cascade: true })
  address: VendorAddress;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;

  @OneToMany(() => Pack, (pack) => pack.vendor, { cascade: true })
  packs: Pack[];
}
