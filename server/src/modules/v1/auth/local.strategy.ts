import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { PasswordHashService } from './password-hash/password-hash.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordHashService: PasswordHashService,
  ) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<User> {
    const user = await this.usersService.findOneByEmail(email);
    if (
      !user ||
      !user.passwordHash ||
      !(await this.passwordHashService.verify(user.passwordHash, password))
    )
      throw new UnauthorizedException();

    return user;
  }
}
