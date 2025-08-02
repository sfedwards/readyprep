import { WatchedList } from '@lib/domain/watched-list';
import { CountItem } from './count-item';

export class CountItems extends WatchedList<CountItem> {
  compareItems(a: CountItem, b: CountItem) {
    return a.equals(b);
  }
}
