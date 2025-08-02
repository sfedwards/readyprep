import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

import { InvoiceItem } from './invoice-item.entity';
import { LocationModel } from '../../../app/locations/infra/models/location.model';
import { Vendor } from '../../vendors/entities';

@Entity()
export class Invoice {
  constructor(Invoice?: Partial<Invoice>) {
    Object.assign(this, Invoice);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LocationModel, { onDelete: 'CASCADE', nullable: true })
  location: LocationModel;

  @Column({ nullable: true })
  locationId: LocationModel['id'];

  @ManyToOne(() => Vendor, { onDelete: 'CASCADE' })
  vendor: Vendor;

  @Column()
  vendorId: Vendor['id'];

  @Column()
  number: string;

  @Column({ type: 'date' })
  date: Date;

  @Column()
  totalPaid: number;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
  items: InvoiceItem[];
}
