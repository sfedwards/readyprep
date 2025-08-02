import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { FdcLink } from './fdc-link.entity';
import { SystemNutrient } from './system-nutrient.entity';

@Entity()
export class SystemIngredient {
  constructor(ingredient: Partial<SystemIngredient> = {}) {
    Object.assign(this, ingredient);
  }

  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  name: string;

  @OneToOne(() => FdcLink, (link) => link.systemIngredient)
  fdcLink: FdcLink;

  @OneToMany(
    () => SystemNutrient,
    (systemNutrient) => systemNutrient.systemIngredient,
  )
  nutrients: SystemNutrient;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
