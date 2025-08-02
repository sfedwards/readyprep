import {
  CountingList,
  CountingListId,
  CountingListItem,
  CountingListName,
  CountingListRepository,
} from '@domain/counting-list';
import { CountingListModel } from './models';
import { LocationId } from '@domain/location';
import { Transactional } from '@modules/infra/database/transactional.decorator';
import { Injectable } from '@nestjs/common';
import { CountingListItemModel } from './models/counting-list-item.model';
import { CountingListItems } from '@domain/counting-list/counting-list-items';

@Injectable()
export class TypeormCountingListRepository implements CountingListRepository {
  @Transactional()
  public async getCountingListById(id: CountingListId): Promise<CountingList> {
    const manager = Transactional.getManager();

    const model = await manager.findOne(CountingListModel, {
      where: {
        id: id.toString(),
      },
      lock: { mode: 'pessimistic_write' },
    });

    const items = await manager.find(CountingListItemModel, {
      where: {
        countingList: model,
      },
    });

    return new CountingList({
      id: CountingListId.from(model.id),
      name: new CountingListName(model.name),
      locationId: LocationId.from(model.locationId),
      items: new CountingListItems(
        ...items.map(({ ingredientId, countingUnitId }) =>
          CountingListItem.from({
            ingredientId,
            unitId: countingUnitId,
          }),
        ),
      ),
    });
  }

  public async save(
    countingList: CountingList,
  ): Promise<CountingListModel['id']> {
    const persistenceCountingList = new CountingListModel();

    persistenceCountingList.id = countingList.getId().toString();
    persistenceCountingList.locationId = countingList.toJSON().locationId;
    persistenceCountingList.name = countingList.toJSON().name;

    await Transactional.getManager().save(persistenceCountingList);

    await Transactional.getManager().delete(CountingListItemModel, {
      countingListId: persistenceCountingList.id,
    });

    const items = countingList.toJSON().items;

    if (items.length > 0) {
      await Transactional.getManager().insert(
        CountingListItemModel,
        items.map(({ ingredientId, unitId }, i) => {
          const item = new CountingListItemModel();
          item.countingListId = persistenceCountingList.id;
          item.ingredientId = ingredientId;
          item.countingUnitId = unitId;
          item.index = i;
          return item;
        }),
      );
    }

    return persistenceCountingList.id;
  }

  @Transactional()
  public async delete(countingList: CountingList): Promise<void> {
    const manager = Transactional.getManager();

    await manager.delete(CountingListModel, {
      id: countingList.getId().toString(),
    });
  }
}

export const CountingListRepositoryProvider = {
  provide: CountingListRepository,
  useClass: TypeormCountingListRepository,
};
