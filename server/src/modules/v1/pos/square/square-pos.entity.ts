import {
  Entity,
  OneToOne,
  JoinColumn,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { SquareToken } from './square-token.entity';
import { SquarePosItemLink } from './square-item-link.entity';
import { LocationModel } from '../../../app/locations/infra/models/location.model';
import { Account } from '../../accounts/account.entity';

@Entity()
export class SquarePos {
  constructor(pos?: Partial<SquarePos>) {
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

  @ManyToOne(() => SquarePosItemLink, (link) => link.pos)
  itemLinks: SquarePosItemLink[];

  @OneToOne(() => SquareToken, (token) => token.pos)
  @JoinColumn()
  token: SquareToken;

  @Column()
  squareLocationId: string;
}
