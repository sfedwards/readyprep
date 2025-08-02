import { Location } from '../location';
import { LocationId } from '../location-id';

export abstract class LocationRepository {
  abstract locationById(id: LocationId): Promise<Location>;
  abstract save(location: Location): Promise<void>;
}
