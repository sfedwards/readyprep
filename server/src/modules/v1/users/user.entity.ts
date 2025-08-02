import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { Account } from '../accounts/account.entity';
import { Role } from './role.entity';

@Entity()
@Index(['email'], { unique: true })
export class User {
  constructor(user?: Partial<User>) {
    Object.assign(this, user);
  }

  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => Account, (account) => account.users, {
    eager: true,
    nullable: false,
  })
  account: Account;

  @Column()
  accountId: Account['id'];

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({
    nullable: true,
  })
  passwordHash: string;

  @Column({
    nullable: true,
  })
  googleId: string;

  @Column({
    nullable: true,
  })
  photoUrl: string;

  @Column({
    default: false,
  })
  allowNotificationEmails: boolean;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable()
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
