import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { MenuItem } from '../../menu-items/menu-item.entity';
import { SquarePos } from './square-pos.entity';

@Entity()
@Unique(['posId', 'idInPos'])
export class SquarePosItemLink {
  constructor(link?: Partial<SquarePosItemLink>) {
    Object.assign(this, link);
  }

  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => SquarePos, { onDelete: 'CASCADE' })
  pos: SquarePos;

  @Column()
  posId: SquarePos['id'];

  @ManyToOne(() => MenuItem, { nullable: true })
  item: MenuItem;

  @Column({ nullable: true })
  itemId: MenuItem['id'];

  @Column()
  idInPos: string;
}
