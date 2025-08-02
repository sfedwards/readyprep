import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

import { Account } from '../../accounts/account.entity';
import { CloverPos } from './clover-pos.entity';

@Entity()
export class CloverToken {
  constructor(token?: Partial<CloverToken>) {
    Object.assign(this, token);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Account)
  account: Account;

  @Column()
  accountId: Account['id'];

  @Column()
  cloverMerchantId: string;

  @Column()
  accessToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @VersionColumn()
  version: number;

  @OneToOne(() => CloverPos, (pos) => pos.token, { onDelete: 'CASCADE' })
  pos: CloverPos;
}
