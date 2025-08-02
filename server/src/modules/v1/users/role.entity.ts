import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  ManyToMany,
} from 'typeorm';
import { User } from './user.entity';

export enum RoleType {
  ACCOUNT_OWNER = 'ACCOUNT_OWNER',
}

@Entity()
export class Role {
  constructor(role: Partial<Role> = {}) {
    Object.assign(this, role);
  }

  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({
    type: 'enum',
    enum: RoleType,
  })
  type: RoleType;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
