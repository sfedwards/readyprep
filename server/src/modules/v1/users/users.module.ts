import { CountingListsModule } from '@modules/app/counting-lists/counting-lists.module';
import { LocationsModule } from '@modules/app/locations/locations.module';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PasswordHashModule } from '../auth/password-hash/password-hash.module';
import { BillingModule } from '../billing/billing.module';
import { EmailsModule } from '../emails/emails.module';
import { JwtModule } from '../jwt/jwt.module';
import { SandboxModule } from '../sandbox/sandbox.module';
import { SegmentModule } from '../segment/segment.module';
import { TransactionManagerModule } from '../transaction-manager/transaction-manager.module';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PasswordHashModule,
    TransactionManagerModule,
    JwtModule,
    EmailsModule,
    forwardRef(() => BillingModule),
    SandboxModule,
    LocationsModule,
    CountingListsModule,
    SegmentModule,
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
