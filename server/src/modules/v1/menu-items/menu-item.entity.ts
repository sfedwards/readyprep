import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Account } from '../accounts/account.entity';
import { MenuSection } from '../menus/menu-section.entity';
import { SquarePosItemLink } from '../pos/square/square-item-link.entity';
import { PlatingRecipe } from '../recipes/plating-recipe.entity';

export enum MenuItemType {
  Regular = 'REGULAR',
  Modifier = 'MODIFIER',
}

@Entity()
@Index(['ownerId', 'scopedId'], { unique: true })
@Index(['ownerId', 'name'], { unique: true, where: '"deletedAt" IS NULL' })
export class MenuItem {
  constructor(menuItem: Partial<MenuItem> = {}) {
    Object.assign(this, menuItem);
  }

  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ default: MenuItemType.Regular })
  type: MenuItemType;

  @ManyToOne(() => Account, (owner) => owner.menus)
  owner: Account;

  @Column()
  ownerId: Account['id'];

  @Column()
  scopedId: number;

  @Column()
  name: string;

  @OneToOne(() => PlatingRecipe, (recipe) => recipe.menuItem)
  @JoinColumn()
  recipe: PlatingRecipe;

  @Column()
  recipeId: PlatingRecipe['id'];

  // A section is always part of a Menu. The sections this Item belongs to determines the Menus it is part of
  @ManyToMany(() => MenuSection, (section) => section.items)
  @JoinTable()
  sections: MenuSection;

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    nullable: true,
  })
  price: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  averageWeeklySales: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => SquarePosItemLink, (link) => link.item)
  links: SquarePosItemLink[];
}
