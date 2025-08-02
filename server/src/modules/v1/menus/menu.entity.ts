import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  ManyToOne,
  OneToMany,
  Index,
  VersionColumn,
} from 'typeorm';
import { Account } from '../accounts/account.entity';
import { MenuSection } from './menu-section.entity';

@Entity()
@Index(['ownerId', 'scopedId'], { unique: true })
@Index(['ownerId', 'name'], { unique: true, where: '"deletedAt" IS NULL' })
export class Menu {
  constructor(menu?: Partial<Menu>) {
    Object.assign(this, menu);
  }

  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => Account, (owner) => owner.menus)
  owner: Account;

  @Column()
  ownerId: Account['id'];

  @Column()
  scopedId: number;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => MenuSection, (menuSection) => menuSection.menu)
  sections: MenuSection[];
}
