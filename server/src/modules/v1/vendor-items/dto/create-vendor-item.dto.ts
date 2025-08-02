import { IsString } from 'class-validator';
import { VendorItem } from '../interface/vendor-item.interface';

export class CreateVendorItemRequestDTO extends VendorItem {}

export class CreateVendorItemResponseDTO {
  @IsString()
  id: string;

  constructor(id: string) {
    this.id = id;
  }
}
