import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { OAuth2Strategy, Profile } from 'passport-google-oauth';

import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { PasswordHashService } from './password-hash/password-hash.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(OAuth2Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordHashService: PasswordHashService,
    private readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.get('googleSignin.clientId'),
      clientSecret: configService.get('googleSignin.clientSecret'),
      callbackURL: `${configService.get(
        'app.baseUrl',
      )}/api/auth/google/callback`,
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<User> {
    const [email, name, googleId] = [
      profile.emails[0].value,
      profile.name.givenName + ' ' + profile.name.familyName,
      profile.id,
    ];
    const user = await this.usersService.findOrCreate({
      email,
      googleId,
      name,
    });
    await this.usersService.update(email, {
      photoUrl: profile.photos[0].value,
    });
    return user;
  }
}
