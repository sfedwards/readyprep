import {
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  OneToMany,
  VersionColumn,
} from 'typeorm';
import { LocationModel } from '../../app/locations/infra/models/location.model';
import { ProductionItem } from './production-item.entity';

@Entity()
export class Production {
  constructor(menu?: Partial<Production>) {
    Object.assign(this, menu);
  }

  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => LocationModel, { onDelete: 'CASCADE' })
  location: LocationModel;

  @Column()
  locationId: LocationModel['id'];

  @Column({ type: 'date' })
  date: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;

  @OneToMany(() => ProductionItem, (item) => item.production, { cascade: true })
  items: ProductionItem[];
}
