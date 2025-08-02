import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  TableInheritance,
  ManyToOne,
  Column,
  OneToMany,
  Index,
} from 'typeorm';
import { Account } from '../accounts/account.entity';
import { RecipeIngredient } from '../recipes/recipe-ingredient.entity';
import { Nutrient } from './nutrient.entity';
import { UnitConversion } from '../units/unit-conversion.entity';

@Entity()
@TableInheritance({ column: { name: 'type', type: 'varchar' } })
@Index(['ownerId', 'type', 'name'], {
  unique: true,
  where: '"deletedAt" IS NULL',
})
@Index(['ownerId', 'scopedId'], { unique: true, where: '"deletedAt" IS NULL' })
export class Ingredient {
  constructor(ingredient?: Partial<Ingredient>) {
    Object.assign(this, ingredient);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @ManyToOne(() => Account, (owner) => owner.menus, { onDelete: 'CASCADE' })
  owner: Account;

  @Column()
  ownerId: Account['id'];

  @Column()
  scopedId: number;

  @Column()
  name: string;

  @Column({
    default: 100,
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  yieldPercent: string;

  @OneToMany(() => RecipeIngredient, (recipe) => recipe.ingredient)
  recipes: RecipeIngredient[];

  @OneToMany(() => Nutrient, (nutrient) => nutrient.ingredient)
  nutrients: Nutrient[];

  @OneToMany(
    () => UnitConversion,
    (unitConversion) => unitConversion.ingredient,
    { cascade: true },
  )
  unitConversions: UnitConversion[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
