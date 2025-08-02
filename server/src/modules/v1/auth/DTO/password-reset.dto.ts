import { IsEmail } from 'class-validator';

export class PasswordResetRequest {
  @IsEmail()
  readonly email: string;
}
