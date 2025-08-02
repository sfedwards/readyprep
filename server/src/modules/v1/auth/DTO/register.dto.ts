import { IsEmail, IsByteLength, IsString, IsNotEmpty } from 'class-validator';

export class Register {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsEmail()
  readonly email: string;

  @IsByteLength(8, 1024, {
    message: 'Password must be at least 8 characters long',
  })
  readonly password: string;
}
