import { LocationId } from '@domain/location';
import { PantryQueries } from '@domain/pantry';
import { Injectable } from '@nestjs/common';
import { GetInventoryResponseDTO } from './dto/get-inventory.response.dto';

@Injectable()
export class PantryService {
  constructor(private readonly pantryQueries: PantryQueries) {}

  public async getInventory(
    locationId: string,
  ): Promise<GetInventoryResponseDTO> {
    return await this.pantryQueries.getInventory(LocationId.from(locationId));
  }
}
