import { IsOptional, IsString } from 'class-validator';

export class VendorAddress {
  @IsString()
  @IsOptional()
  street1 = '';

  @IsString()
  @IsOptional()
  street2 = '';

  @IsString()
  @IsOptional()
  city = '';

  @IsString()
  @IsOptional()
  state = '';

  @IsString()
  @IsOptional()
  zip = '';
}
