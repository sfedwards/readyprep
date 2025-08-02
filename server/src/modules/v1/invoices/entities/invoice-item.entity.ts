import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

import { InventoryLog } from '../../inventory/log.entity';
import { Invoice } from './invoice.entity';
import { Pack } from '../../ingredients/pack.entity';

@Entity()
export class InvoiceItem {
  constructor(Invoice?: Partial<InvoiceItem>) {
    Object.assign(this, Invoice);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Invoice, { onDelete: 'CASCADE' })
  invoice: Invoice;

  @Column()
  invoiceId: Invoice['id'];

  @ManyToOne(() => Pack, { cascade: true, onDelete: 'CASCADE' })
  pack: Pack;

  @Column()
  packId: Pack['id'];

  @Column()
  pricePaid: number;

  @Column()
  numPacks: number;

  @OneToOne(() => InventoryLog, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  inventoryLog: InventoryLog;

  @Column()
  inventoryLogId: InventoryLog['id'];

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;
}
