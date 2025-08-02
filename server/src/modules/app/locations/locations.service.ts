import { Injectable } from '@nestjs/common';

import { LocationModel } from '@app/locations/infra/models/location.model';
import { Account } from '@modules/v1/accounts/account.entity';
import { Transactional } from '@modules/infra/database/transactional.decorator';
import { AddLocationRequestDto } from './dto/add-location.dto';
import { LocationRepository } from '@domain/location/interfaces/location.repo';
import {
  LocationAddress,
  LocationId,
  LocationName,
  LocationPhoneNumber,
} from '@domain/location';

@Injectable()
export class LocationsService {
  public constructor(private readonly locationsRepo: LocationRepository) {}

  @Transactional()
  public async addLocation(
    accountId: Account['id'],
    data: AddLocationRequestDto,
  ): Promise<void> {
    const manager = Transactional.getManager();

    const hasLocation = !!(await this.getLocation(accountId));

    if (hasLocation) {
      console.error('Cannot create multiple locations yet');
      return;
    }

    const location = new LocationModel({
      accountId,
      name: data.name,
      address: data.address,
      phoneNumber: data.phoneNumber,
    });

    await manager.save(location);
  }

  @Transactional()
  public async getLocation(accountId: Account['id']): Promise<LocationModel> {
    const manager = Transactional.getManager();

    const location = await manager.findOne(LocationModel, {
      where: {
        accountId,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return location;
  }

  @Transactional()
  public async updateLocationDetails(
    locationId: LocationId,
    data: AddLocationRequestDto,
  ): Promise<void> {
    const location = await this.locationsRepo.locationById(locationId);

    location.updateDetails(
      new LocationName(data.name),
      new LocationAddress(data.address),
      new LocationPhoneNumber(data.phoneNumber),
    );

    await this.locationsRepo.save(location);
  }
}
