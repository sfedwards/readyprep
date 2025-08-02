import {
  Count,
  CountDate,
  CountId,
  CountItem,
  CountRepository,
} from '@domain/count';
import { CountModel } from './models';
import { LocationId } from '@domain/location';
import { Transactional } from '@modules/infra/database/transactional.decorator';
import { Injectable } from '@nestjs/common';
import { CountItemModel } from './models/count-item.model';
import { WatchedList } from '@lib/domain/watched-list';
import { CountItems } from '@domain/count/count-items';
import { In } from 'typeorm';
import { CountingListId } from '@domain/counting-list';

@Injectable()
export class TypeormCountRepository implements CountRepository {
  @Transactional()
  public async getCountById(id: CountId): Promise<Count> {
    const manager = Transactional.getManager();

    const model = await manager.findOne(CountModel, {
      where: {
        id: id.toString(),
      },
      lock: { mode: 'pessimistic_write' },
    });

    const items = await manager.find(CountItemModel, {
      where: {
        count: model,
      },
    });

    return new Count({
      id: CountId.from(model.id),
      locationId: LocationId.from(model.locationId),
      countingListId: CountingListId.from(model.countingListId),
      date: CountDate.from(model.date.toISOString().slice(0, 10)),
      items: new CountItems(
        items.map(({ ingredientId, theoreticalQuantity, actualQuantity }) =>
          CountItem.from({
            ingredientId,
            theoreticalQuantity,
            actualQuantity,
          }),
        ),
      ),
    });
  }

  public async save(count: Count) {
    const persistenceCount = new CountModel();
    persistenceCount.id = count.getId().toString();
    persistenceCount.locationId = count.toJSON().locationId;
    persistenceCount.countingListId = count.toJSON().countingListId;
    persistenceCount.date = new Date(count.toJSON().date + 'Z');

    await Transactional.getManager().save(persistenceCount);

    const removedItems = count.items.getRemovedItems();

    if (removedItems?.length > 0) {
      await Transactional.getManager().delete(CountItemModel, {
        countId: persistenceCount.id,
        ingredientId: In(removedItems.map(({ ingredientId }) => ingredientId)),
      });
    }

    const newItems = count.items.getNewItems();

    if (newItems?.length > 0) {
      await Transactional.getManager().insert(
        CountItemModel,
        newItems.map(
          ({ ingredientId, theoreticalQuantity, actualQuantity }) => {
            const item = new CountItemModel();
            item.countId = persistenceCount.id;
            item.ingredientId = ingredientId;
            item.theoreticalQuantity = theoreticalQuantity;
            item.actualQuantity = actualQuantity;
            return item;
          },
        ),
      );
    }

    return persistenceCount.id;
  }
}

export const CountRepositoryProvider = {
  provide: CountRepository,
  useClass: TypeormCountRepository,
};
