import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Vendor } from '.';

@Entity()
export class VendorAddress {
  constructor(vendor?: Partial<VendorAddress>) {
    Object.assign(this, vendor);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Vendor, { onDelete: 'CASCADE' })
  @JoinColumn()
  vendor: Vendor;

  vendorId: Vendor['id'];

  @Column()
  street1: string;

  @Column()
  street2: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  zip: string;
}
