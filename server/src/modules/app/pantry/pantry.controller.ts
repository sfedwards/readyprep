import { SessionData } from '@modules/v1/auth/interface/session-data.interface';
import { Controller, Get, Session } from '@nestjs/common';
import { GetInventoryResponseDTO } from './dto/get-inventory.response.dto';
import { PantryService } from './pantry.service';

@Controller('pantry')
export class PantryController {
  constructor(private readonly pantryService: PantryService) {}

  @Get('inventory')
  public async getInventory(
    @Session() { locationId }: SessionData,
  ): Promise<GetInventoryResponseDTO> {
    return await this.pantryService.getInventory(locationId);
  }
}
