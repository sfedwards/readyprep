import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { VendorAddress } from '../interface/vendor-address.interface';
import { VendorContact } from '../interface/vendor-contact.interface';
import { VendorOrderMethod } from '../enum/order-method.enum';

export class CreateVendorRequestDTO {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  accountNumber = '';

  @IsEnum(VendorOrderMethod)
  @IsOptional()
  orderMethod: VendorOrderMethod = VendorOrderMethod.MANUAL;

  @IsOptional()
  @IsBoolean()
  includePricesOnPurchaseOrders: boolean;

  @ValidateNested()
  @IsOptional()
  primaryContact: VendorContact = new VendorContact();

  @ValidateNested()
  @IsOptional()
  address: VendorAddress = new VendorAddress();
}

export class CreateVendorResponseDTO {
  @IsString()
  id: string;

  constructor(id: string) {
    this.id = id;
  }
}
