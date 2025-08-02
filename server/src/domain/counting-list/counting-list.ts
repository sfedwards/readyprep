import { AggregateRoot } from '@lib/domain/aggregate-root';
import { LocationId } from '@domain/location';
import { CountingListItems } from './counting-list-items';
import { CountingListId, CountingListName } from '.';

export interface CountingListProps {
  id?: CountingListId;
  name: CountingListName;
  locationId: LocationId;
  items?: CountingListItems;
}

export class CountingList extends AggregateRoot<CountingListId> {
  public readonly locationId: LocationId;

  private name?: CountingListName;
  private items: CountingListItems;

  constructor({ id, name, locationId, items }: CountingListProps) {
    super(id ?? new CountingListId());
    this.name = name;
    this.locationId = locationId;

    this.items = items ?? new CountingListItems();
  }

  toJSON() {
    return {
      name: this.name?.toString() ?? '',
      locationId: this.locationId.toString(),
      items: [...this.items],
    };
  }

  setName(name: string): void {
    this.name = new CountingListName(name);
  }

  setItems(countingListItems: CountingListItems): void {
    this.items = countingListItems;
  }

  addItems(countingListItems: CountingListItems): void {
    this.items.push(...countingListItems);
  }

  clearItems(): void {
    this.items = [];
  }
}
