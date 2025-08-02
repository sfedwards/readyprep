import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { MenuItem } from '../../menu-items/menu-item.entity';
import { CloverPos } from './clover-pos.entity';

@Entity()
@Unique(['posId', 'idInPos'])
export class CloverPosItemLink {
  constructor(link?: Partial<CloverPosItemLink>) {
    Object.assign(this, link);
  }

  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => CloverPos, { onDelete: 'CASCADE' })
  pos: CloverPos;

  @Column()
  posId: CloverPos['id'];

  @ManyToOne(() => MenuItem, { nullable: true })
  item: MenuItem;

  @Column({ nullable: true })
  itemId: MenuItem['id'];

  @Column()
  idInPos: string;
}
