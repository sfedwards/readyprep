import {
  CountingList,
  CountingListId,
  CountingListItem,
  CountingListName,
  CountingListQueries,
  CountingListRepository,
} from '@domain/counting-list';
import {
  CountingListDto,
  CountingListSummaryDto,
} from '@domain/counting-list/interfaces/dto';
import { LocationId } from '@domain/location';
import { Transactional } from '@modules/infra/database/transactional.decorator';
import { Account } from '@modules/v1/accounts/account.entity';
import { Ingredient } from '@modules/v1/ingredients/ingredient.entity';
import { UnitsService } from '@modules/v1/units/units.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  UpdateCountingListRequestDto,
  RenameCountingListRequestDto,
  CreateCountingListRequestDto,
  MoveToCountingListRequestDto,
} from './dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class CountingListsService {
  public constructor(
    private readonly countingListQueries: CountingListQueries,
    private readonly countingListRepo: CountingListRepository,
    private readonly unitsService: UnitsService,
  ) {}

  public async getCountingList(id: CountingListId): Promise<CountingListDto> {
    return await this.countingListQueries.getCountingListById(id);
  }

  @Transactional()
  public async getCountingListsByLocation(
    locationId: LocationId,
  ): Promise<CountingListSummaryDto[]> {
    return await this.countingListQueries.getCountingListsByLocation(
      locationId,
    );
  }

  @Transactional()
  public async renameCountingList(
    id: CountingListId,
    { name }: RenameCountingListRequestDto,
  ): Promise<void> {
    const countingList = await this.countingListRepo.getCountingListById(id);
    countingList.setName(name);
    await this.countingListRepo.save(countingList);
  }

  @Transactional()
  public async createCountingList(
    ownerId: Account['id'],
    locationId: LocationId,
    { name, ingredients }: CreateCountingListRequestDto,
  ): Promise<string> {
    const id = uuid();

    const countingList = new CountingList({
      id: CountingListId.from(id),
      name: new CountingListName(name),
      locationId,
    });

    await this.updateCountingList(ownerId, countingList, { name, ingredients });

    return id;
  }

  @Transactional()
  public async saveCountingList(
    ownerId: Account['id'],
    id: CountingListId,
    data: UpdateCountingListRequestDto,
  ): Promise<void> {
    const countingList = await this.countingListRepo.getCountingListById(id);
    await this.updateCountingList(ownerId, countingList, data);
  }

  @Transactional()
  public async deleteCountingList(
    locationId: LocationId,
    id: CountingListId,
  ): Promise<void> {
    const countingList = await this.countingListRepo.getCountingListById(id);
    if (countingList.locationId.toString() !== locationId.toString())
      throw new NotFoundException();
    await this.countingListRepo.delete(countingList);
  }

  @Transactional()
  public async moveToCountingList(
    ownerId: Account['id'],
    locationId: LocationId,
    id: CountingListId,
    data: MoveToCountingListRequestDto,
  ): Promise<void> {
    const countingList = await this.countingListRepo.getCountingListById(id);
    if (countingList.locationId.toString() !== locationId.toString())
      throw new NotFoundException();

    await this.addIngredients(ownerId, countingList, data.ingredients);
    await this.countingListRepo.save(countingList);
  }

  @Transactional()
  private async updateCountingList(
    ownerId: Account['id'],
    countingList: CountingList,
    data: UpdateCountingListRequestDto,
  ) {
    if (data.name) {
      countingList.setName(data.name);
    }

    countingList.clearItems();
    await this.addIngredients(ownerId, countingList, data.ingredients);

    await this.countingListRepo.save(countingList);
  }

  @Transactional()
  private async addIngredients(
    ownerId: Account['id'],
    countingList: CountingList,
    data: UpdateCountingListRequestDto['ingredients'],
  ): Promise<void> {
    const manager = Transactional.getManager();

    countingList.addItems(
      await Promise.all(
        data.map(async ({ id, unit }) => {
          const { id: ingredientId } = await manager.findOne(Ingredient, {
            ownerId,
            scopedId: id,
          });

          const { id: unitId } = await this.unitsService.findByAlias(
            { ownerId, alias: unit },
            manager,
          );
          return CountingListItem.from({ ingredientId, unitId });
        }),
      ),
    );
  }
}
