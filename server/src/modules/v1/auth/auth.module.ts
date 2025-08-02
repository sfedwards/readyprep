import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './local.strategy';
import { PassportModule } from '@nestjs/passport';
import { PasswordHashModule } from './password-hash/password-hash.module';
import { EmailsModule } from '../emails/emails.module';
import { JwtModule } from '../jwt/jwt.module';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './google.strategy';
import { TransactionManagerModule } from '../transaction-manager/transaction-manager.module';
import { BillingModule } from '../billing/billing.module';
import { SegmentModule } from '../segment/segment.module';

@Module({
  imports: [
    PassportModule.register({ session: true }),
    UsersModule,
    PasswordHashModule,
    EmailsModule,
    JwtModule,
    TransactionManagerModule,
    BillingModule,
    SegmentModule,
  ],
  providers: [AuthService, LocalStrategy, GoogleStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
