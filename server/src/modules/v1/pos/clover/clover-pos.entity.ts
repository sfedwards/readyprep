import {
  Entity,
  OneToOne,
  JoinColumn,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CloverToken } from './clover-token.entity';
import { CloverPosItemLink } from './clover-item-link.entity';
import { LocationModel } from '../../../app/locations/infra/models/location.model';
import { Account } from '../../accounts/account.entity';

@Entity()
export class CloverPos {
  constructor(pos?: Partial<CloverPos>) {
    Object.assign(this, pos);
  }

  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => Account)
  account: Account;

  @Column()
  accountId: Account['id'];

  @ManyToOne(() => LocationModel, { onDelete: 'CASCADE' })
  location: LocationModel;

  @Column()
  locationId: LocationModel['id'];

  @ManyToOne(() => CloverPosItemLink, (link) => link.pos)
  itemLinks: CloverPosItemLink[];

  @OneToOne(() => CloverToken, (token) => token.pos)
  @JoinColumn()
  token: CloverToken;

  @Column()
  cloverMerchantId: string;
}
