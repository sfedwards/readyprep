import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  ValidateNested,
} from 'class-validator';

import { IInvoiceItem } from '../interface/invoice-item.interface';
import { Type } from 'class-transformer';
import { Vendor, VendorOrder } from '@modules/v1/vendors/entities';

export class CreateInvoiceRequestDTO {
  @IsString()
  vendorId: Vendor['id'];

  @IsString()
  @IsOptional()
  number = '';

  @IsString()
  @Matches(/2\d{3}-(0[1-9]|1[0-2])/)
  date: string;

  @IsArray()
  @ValidateNested()
  @Type(() => IInvoiceItem)
  items: IInvoiceItem[];

  @IsUUID()
  @IsOptional()
  orderId: VendorOrder['id'];

  @IsBoolean()
  updateCatalogPrices: boolean;
}

export class CreateInvoiceResponseDTO {
  @IsString()
  id: string;

  constructor(id: string) {
    this.id = id;
  }
}
