import {
  Location,
  LocationAddress,
  LocationId,
  LocationName,
  LocationPhoneNumber,
} from '@domain/location';
import { LocationRepository } from '@domain/location/interfaces/location.repo';
import { Transactional } from '@modules/infra/database/transactional.decorator';
import { LocationModel } from './models';

export class TypeormLocationRepository implements LocationRepository {
  @Transactional()
  public async locationById(locationId: LocationId): Promise<Location | null> {
    const manager = Transactional.getManager();

    const locationModel = await manager.findOne(
      LocationModel,
      locationId.toString(),
    );

    const [id, name, address, phoneNumber] = [
      new LocationId(locationModel.id),
      new LocationName(locationModel.name),
      new LocationAddress(locationModel.address),
      new LocationPhoneNumber(locationModel.phoneNumber),
    ];

    const location = Location.from({
      id,
      name,
      address,
      phoneNumber,
    });

    return location;
  }

  @Transactional()
  public async save(location: Location): Promise<void> {
    const manager = Transactional.getManager();

    const data = location.toJSON();

    const locationModel = new LocationModel();

    locationModel.id = data.id;
    locationModel.name = data.name;
    locationModel.address = data.address;
    locationModel.phoneNumber = data.phoneNumber;

    await manager.save(locationModel);
  }
}

export const LocationRepositoryProvider = {
  provide: LocationRepository,
  useClass: TypeormLocationRepository,
};
