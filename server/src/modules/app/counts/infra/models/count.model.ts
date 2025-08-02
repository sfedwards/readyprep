import { LocationModel } from '@app/locations/infra/models';
import { CountingListModel } from '@modules/app/counting-lists/infra/models';
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { CountItemModel } from './count-item.model';

@Entity({
  name: 'counts',
})
export class CountModel {
  @PrimaryColumn('uuid')
  id: string;

  @ManyToOne(() => LocationModel, { onDelete: 'CASCADE' })
  location: LocationModel;

  @Column()
  locationId: LocationModel['id'];

  @ManyToOne(() => CountingListModel, { nullable: true, onDelete: 'SET NULL' })
  countingList: CountingListModel;

  @Column({ nullable: true })
  countingListId: CountingListModel['id'];

  @Column()
  date: Date;

  @OneToMany(() => CountItemModel, (item) => item.count)
  items: CountItemModel[];
}
