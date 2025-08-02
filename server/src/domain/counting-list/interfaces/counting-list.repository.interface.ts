import { CountingList, CountingListId } from '..';

export abstract class CountingListRepository {
  abstract getCountingListById(id: CountingListId): Promise<CountingList>;
  abstract save(count: CountingList): Promise<string>;
  abstract delete(countingList: CountingList): Promise<void>;
}
