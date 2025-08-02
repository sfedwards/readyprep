import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Vendor } from '.';

@Entity()
export class VendorContact {
  constructor(vendorContact?: Partial<VendorContact>) {
    Object.assign(this, vendorContact);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Vendor, { onDelete: 'CASCADE' })
  @JoinColumn()
  vendor: Vendor;

  vendorId: Vendor['id'];

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  officePhone: string;

  @Column()
  mobilePhone: string;
}
