import { AggregateRoot } from '@lib/domain/aggregate-root';
import { LocationId } from '@domain/location';
import { CountId, CountDate, CountItem } from '.';
import { CountItems } from './count-items';
import { CountingListId } from '@domain/counting-list';

export interface CountProps {
  id?: CountId;
  locationId: LocationId;
  countingListId: CountingListId;
  date: CountDate;
  items?: CountItems;
}

export class Count extends AggregateRoot<CountId> {
  public readonly locationId: LocationId;
  private readonly countingListId: CountingListId;

  public readonly date: CountDate;
  public readonly items: CountItems;

  constructor({ id, locationId, countingListId, date, items }: CountProps) {
    super(id ?? new CountId());
    this.locationId = locationId;
    this.countingListId = countingListId;
    this.date = date;

    this.items = items ?? new CountItems([]);
  }

  toJSON() {
    return {
      locationId: this.locationId.toString(),
      countingListId: this.countingListId.toString(),
      date: this.date,
      items: [...this.items],
    };
  }

  setActualQuantity(ingredientId: string, quantity: number) {
    const item = CountItem.from({
      ingredientId,
      theoreticalQuantity: 0,
      actualQuantity: quantity,
    });

    this.items.getItems().forEach((item) => {
      if (item.ingredientId === ingredientId) this.items.remove(item);
    });

    this.items.add(item);
  }
}
