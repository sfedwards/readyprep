import { Module, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import { PosModule } from '../pos/pos.module';
import { TransactionManagerModule } from '../transaction-manager/transaction-manager.module';
import { UsersModule } from '../users/users.module';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { SegmentModule } from '../segment/segment.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PosModule,
    TransactionManagerModule,
    SegmentModule,
  ],
  providers: [
    BillingService,
    {
      provide: 'Stripe',
      useFactory: (configService: ConfigService) => {
        return new Stripe(configService.get('stripe.apiKey'), {
          apiVersion: '2020-08-27',
        });
      },
      inject: [ConfigService],
    },
  ],
  controllers: [BillingController],
  exports: [BillingService, 'Stripe'],
})
export class BillingModule {}
