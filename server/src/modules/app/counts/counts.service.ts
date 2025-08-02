import { AccountId } from '@domain/account';
import {
  Count,
  CountDate,
  CountDto,
  CountId,
  CountQueries,
  CountRepository,
  CountSummaryDto,
} from '@domain/count';
import { LocationId } from '@domain/location';
import { Transactional } from '@modules/infra/database/transactional.decorator';
import { Ingredient } from '@modules/v1/ingredients/ingredient.entity';
import { V1IngredientsService } from '@modules/v1/ingredients/ingredients.service';
import { Injectable } from '@nestjs/common';
import { UpdateCountRequestDto } from './dto/update-count.request.dto';

@Injectable()
export class CountsService {
  constructor(
    private readonly countQueries: CountQueries,
    private readonly countRepo: CountRepository,
    private readonly ingredientsService: V1IngredientsService,
  ) {}

  public async getCount(id: CountId): Promise<CountDto> {
    return await this.countQueries.getCountById(id);
  }

  @Transactional()
  public async getCountsByLocation(
    locationId: LocationId,
  ): Promise<CountSummaryDto[]> {
    return await this.countQueries.getCountsByLocation(locationId);
  }

  @Transactional()
  public async createCount(
    locationId: LocationId,
    countingListId,
    date: string,
  ): Promise<string> {
    const count = new Count({
      locationId,
      countingListId,
      date: CountDate.from(date),
    });

    return await this.countRepo.save(count);
  }

  @Transactional()
  public async updateCount(
    accountId: string,
    id: CountId,
    { ingredientId, actualQuantity }: UpdateCountRequestDto,
  ): Promise<void> {
    const manager = Transactional.getManager();
    const ingredient = await manager.findOne(Ingredient, {
      ownerId: accountId,
      scopedId: ingredientId,
    });
    const count = await this.countRepo.getCountById(id);
    count.setActualQuantity(ingredient.id, actualQuantity);
    await this.countRepo.save(count);
  }
}
