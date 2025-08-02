import { Count, CountId } from '..';

export abstract class CountRepository {
  abstract getCountById(id: CountId): Promise<Count>;
  abstract save(count: Count): Promise<string>;
}
