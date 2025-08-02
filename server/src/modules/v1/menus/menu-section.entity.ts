import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  ManyToOne,
  ManyToMany,
} from 'typeorm';
import { MenuItem } from '../menu-items/menu-item.entity';
import { Menu } from './menu.entity';

@Entity()
export class MenuSection {
  constructor(menuSection?: Partial<MenuSection>) {
    Object.assign(this, menuSection);
  }

  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => Menu, (menu) => menu.sections, { onDelete: 'CASCADE' })
  menu: Menu;

  @Column()
  menuId: Menu['id'];

  @Column()
  name: string;

  @ManyToMany(() => MenuItem, (item) => item.sections)
  items: MenuItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
