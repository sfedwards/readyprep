import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { LocationModel } from '../../app/locations/infra/models/location.model';
import { Menu } from '../menus/menu.entity';
import { SquareToken } from '../pos/square/square-token.entity';
import { User } from '../users/user.entity';

@Entity()
@Index(['stripeCustomerId'], { unique: true })
export class Account {
  constructor(account?: Partial<Account>) {
    Object.assign(this, account);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: true })
  isInSandboxMode: boolean;

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ nullable: true })
  plan: 'BASIC' | 'PREMIUM';

  @Column({ nullable: true })
  planState: string;

  @Column({ nullable: true })
  trialEnd: Date;

  @Column({ nullable: true })
  currentPeriodEnd: Date;

  @Column({ default: false })
  hasNewPosItems: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => User, (user) => user.account)
  users: User[];

  @OneToMany(() => Menu, (menu) => menu.owner)
  menus: Menu[];

  @OneToMany(() => LocationModel, (location) => location.account, {
    eager: true,
  })
  locations: LocationModel[];

  @OneToMany(() => SquareToken, (token) => token.account)
  squareTokens: SquareToken[];
}
