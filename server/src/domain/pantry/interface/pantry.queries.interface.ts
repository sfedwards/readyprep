import { LocationId } from '@domain/location';
import { PantryInventoryDTO } from './dto/pantry-inventory.dto';

export abstract class PantryQueries {
  abstract getInventory(locationId: LocationId): Promise<PantryInventoryDTO>;
}
