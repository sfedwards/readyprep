import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateIf,
} from 'class-validator';

export class VendorContact {
  @IsString()
  @IsOptional()
  name = '';

  @IsEmail()
  @IsOptional()
  @ValidateIf((e) => e.email !== '')
  email = '';

  @IsPhoneNumber('US')
  @IsOptional()
  @ValidateIf((e) => e.officePhone !== '')
  officePhone = '';

  @IsPhoneNumber('US')
  @IsOptional()
  @ValidateIf((e) => e.mobilePhone !== '')
  mobilePhone = '';
}
