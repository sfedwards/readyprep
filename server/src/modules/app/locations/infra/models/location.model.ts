import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { v4 as uuid } from 'uuid';

import { Account } from '@modules/v1/accounts/account.entity';
import { CountingListModel } from '@modules/app/counting-lists/infra/models';

@Entity('location')
export class LocationModel {
  constructor(location?: Partial<LocationModel>) {
    Object.assign(this, location);

    if (!location?.id) this.id = uuid();
  }

  @PrimaryColumn('uuid')
  id: string;

  @ManyToOne(() => Account, (account) => account.locations)
  @JoinColumn()
  account: Account;

  @Column()
  accountId: Account['id'];

  @Column({ default: '' })
  name: string;

  @Column({ default: '' })
  address: string;

  @Column({ default: '' })
  phoneNumber: string;

  @Column({ nullable: true })
  logo: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => CountingListModel, (list) => list.location)
  countingLists: CountingListModel[];
}
