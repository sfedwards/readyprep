import { IsByteLength, IsString } from 'class-validator';

export class ConfirmPasswordResetRequest {
  @IsString()
  readonly token: string;

  @IsByteLength(8, 1024, {
    message: 'Password must be at least 8 characters long',
  })
  readonly password: string;
}
