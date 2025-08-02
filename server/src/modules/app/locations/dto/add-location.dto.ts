import { IsString } from 'class-validator';

export class AddLocationRequestDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  phoneNumber: string;
}
