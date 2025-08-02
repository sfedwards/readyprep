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
import { SquarePos } from './square-pos.entity';

@Entity()
export class SquareToken {
  constructor(token?: Partial<SquareToken>) {
    Object.assign(this, token);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Account)
  account: Account;

  @Column()
  accountId: Account['id'];

  @Column()
  squareMerchantId: string;

  @Column()
  accessToken: string;

  @Column()
  expiresAt: Date;

  @Column()
  refreshToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @VersionColumn()
  version: number;

  @OneToOne(() => SquarePos, (pos) => pos.token, { onDelete: 'CASCADE' })
  pos: SquarePos;
}
