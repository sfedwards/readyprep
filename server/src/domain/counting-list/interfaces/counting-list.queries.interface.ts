import { IngredientScopedId } from '@domain/ingredients';
import { LocationId } from '@domain/location';
import { CountingListId } from '../counting-list-id';
import { CountingListDto, CountingListSummaryDto } from './dto';

export abstract class CountingListQueries {
  abstract getCountingListById(id: CountingListId): Promise<CountingListDto>;

  abstract getCountingListsByLocation(
    locationId: LocationId,
  ): Promise<CountingListSummaryDto[]>;

  abstract getListSummaryForIngredient(
    locationId: LocationId,
    ingredientId: IngredientScopedId,
  ): Promise<{ list: CountingListSummaryDto; unit: string }>;
}
