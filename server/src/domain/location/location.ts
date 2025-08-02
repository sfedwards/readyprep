import {
  LocationAddress,
  LocationId,
  LocationName,
  LocationPhoneNumber,
} from '.';

export interface LocationProps {
  id: LocationId;
  name: LocationName;
  address: LocationAddress;
  phoneNumber: LocationPhoneNumber;
}

export class Location {
  private id: LocationId;
  private name: LocationName;
  private address: LocationAddress;
  private phoneNumber: LocationPhoneNumber;

  private constructor({ id, name, address, phoneNumber }: LocationProps) {
    this.id = id;
    this.name = name;
    this.address = address;
    this.phoneNumber = phoneNumber;
  }

  public updateDetails(
    name: LocationName,
    address: LocationAddress,
    phoneNumber: LocationPhoneNumber,
  ): void {
    this.name = name;
    this.address = address;
    this.phoneNumber = phoneNumber;
  }

  public static from(props: LocationProps): Location {
    return new Location(props);
  }

  public toJSON() {
    return {
      id: this.id.toString(),
      name: this.name.toString(),
      address: this.address.toString(),
      phoneNumber: this.phoneNumber.toString(),
    };
  }
}
