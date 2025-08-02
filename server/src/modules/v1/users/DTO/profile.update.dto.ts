import { IsOptional, IsString, IsByteLength, IsEmail } from 'class-validator';

export class UpdateProfileRequest {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  currentPassword: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsByteLength(8)
  password: string;
}
