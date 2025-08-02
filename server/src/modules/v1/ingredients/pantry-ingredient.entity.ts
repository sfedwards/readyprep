import {
  ChildEntity,
  Column,
  OneToMany,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Unit } from '../units/unit.entity';
import { Ingredient } from './ingredient.entity';
import { Pack } from './pack.entity';
import { SystemIngredient } from './system/system-ingredient.entity';

@ChildEntity()
export class PantryIngredient extends Ingredient {
  constructor(ingredient?: Partial<PantryIngredient>) {
    super();
    Object.assign(this, ingredient);
  }

  @ManyToOne(() => SystemIngredient, { nullable: true })
  systemIngredientLink: SystemIngredient;

  @Column({ nullable: true })
  orderFrequency: number;

  @ManyToOne(() => Unit, { nullable: true })
  standardUOM: Unit;

  @Column()
  standardUOMId: Unit['id'];

  @OneToMany(() => Pack, (pack) => pack.pantryIngredient, {
    cascade: true,
  })
  packs: Pack[];

  @OneToOne(() => Pack, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  defaultPack: Pack;

  @Column()
  defaultPackId: Pack['id'];
}
