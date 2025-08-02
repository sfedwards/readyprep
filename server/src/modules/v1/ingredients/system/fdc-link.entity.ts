import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { SystemIngredient } from './system-ingredient.entity';

@Entity()
export class FdcLink {
  constructor(fdcLink: Partial<FdcLink> = {}) {
    Object.assign(this, fdcLink);
  }

  @PrimaryGeneratedColumn('uuid')
  id: number;

  @OneToOne(() => SystemIngredient, (ingredient) => ingredient.fdcLink)
  @JoinColumn()
  systemIngredient: SystemIngredient;

  @Column()
  fdc_id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
