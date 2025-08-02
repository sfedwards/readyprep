import { LocationId } from '@domain/location';
import { SessionData } from '@modules/v1/auth/interface/session-data.interface';
import { LoggedInGuard } from '@modules/v1/auth/logged-in.guard';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Session,
  UseGuards,
} from '@nestjs/common';
import { AddLocationRequestDto } from './dto/add-location.dto';
import { GetLocationDetailsResponseDto } from './dto/get-location-details.dto';
import { LocationsService } from './locations.service';

@Controller('locations')
@UseGuards(LoggedInGuard)
export class LocationsController {
  public constructor(private readonly locationsService: LocationsService) {}

  @Post()
  public async addLocation(
    @Body() data: AddLocationRequestDto,
    @Session() { accountId }: SessionData,
  ): Promise<Record<string, never>> {
    await this.locationsService.addLocation(accountId, data);
    return {};
  }

  @Get(':id')
  public async getLocationDetails(
    @Param('id') id: string,
    @Session() { accountId }: SessionData,
  ): Promise<GetLocationDetailsResponseDto> {
    const location = await this.locationsService.getLocation(accountId);
    if (location?.id !== id) throw new NotFoundException();

    return {
      name: location.name,
      address: location.address,
      phoneNumber: location.phoneNumber,
    };
  }

  @Patch(':id')
  public async updateLocationDetails(
    @Param('id') id: string,
    @Body() data: AddLocationRequestDto,
    @Session() { accountId }: SessionData,
  ): Promise<void> {
    const location = await this.locationsService.getLocation(accountId);
    if (location?.id !== id) throw new NotFoundException();

    await this.locationsService.updateLocationDetails(new LocationId(id), data);

    return;
  }
}
