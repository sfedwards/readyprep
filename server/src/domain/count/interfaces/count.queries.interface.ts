import { LocationId } from '@domain/location';
import { CountId } from '../count-id';
import { CountDto, CountSummaryDto } from './dto';

export abstract class CountQueries {
  abstract getCountById(id: CountId): Promise<CountDto>;

  abstract getCountsByLocation(
    locationId: LocationId,
  ): Promise<CountSummaryDto[]>;
}
