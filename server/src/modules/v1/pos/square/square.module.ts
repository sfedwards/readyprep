import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MenuItemsModule } from '@modules/v1/menu-items/menu-items.module';
import { TransactionManagerModule } from '@modules/v1/transaction-manager/transaction-manager.module';

import { SquareController } from './square.controller';
import { SquareService } from './square.service';

@Module({
  imports: [MenuItemsModule, TransactionManagerModule],
  controllers: [SquareController],
  providers: [
    {
      provide: 'SQUARE_V1_WEBHOOK_KEY',
      useFactory: (configService: ConfigService) =>
        configService.get('square.v1WebhookKey'),
      inject: [ConfigService],
    },
    {
      provide: 'SQUARE_WEBHOOK_KEY',
      useFactory: (configService: ConfigService) =>
        configService.get('square.webhookKey'),
      inject: [ConfigService],
    },
    {
      provide: 'SQUARE_APP_ID',
      useFactory: (configService: ConfigService) =>
        configService.get('square.appId'),
      inject: [ConfigService],
    },
    {
      provide: 'SQUARE_SECRET',
      useFactory: (configService: ConfigService) =>
        configService.get('square.secret'),
      inject: [ConfigService],
    },
    SquareService,
  ],
  exports: [SquareService],
})
export class SquareModule {}
