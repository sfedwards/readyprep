import { LocationModel } from '@app/locations/infra/models';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CountingListItemModel } from './counting-list-item.model';

@Entity({
  name: 'counting_lists',
})
@Index(['locationId', 'isDefault'], {
  unique: true,
  where: '"isDefault"',
})
export class CountingListModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LocationModel, (location) => location.countingLists, {
    onDelete: 'CASCADE',
  })
  location: LocationModel;

  @Column()
  locationId: LocationModel['id'];

  @Column({ default: false })
  isDefault: true;

  @Column()
  name: string;

  @OneToMany(() => CountingListItemModel, (item) => item.countingList)
  items: CountingListItemModel[];

  @CreateDateColumn()
  createdAt: Date;
}
