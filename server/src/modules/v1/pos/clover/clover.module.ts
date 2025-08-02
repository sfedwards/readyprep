import { MenuItemsModule } from '@modules/v1/menu-items/menu-items.module';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CloverController } from './clover.controller';
import { CloverService } from './clover.service';

@Module({
  imports: [MenuItemsModule],
  controllers: [CloverController],
  providers: [
    {
      provide: 'CLOVER_APP_ID',
      useFactory: (configService: ConfigService) =>
        configService.get('clover.appId'),
      inject: [ConfigService],
    },
    {
      provide: 'CLOVER_APP_SECRET',
      useFactory: (configService: ConfigService) =>
        configService.get('clover.appSecret'),
      inject: [ConfigService],
    },
    {
      provide: 'CLOVER_CODE',
      useFactory: (configService: ConfigService) =>
        configService.get('clover.webhookVerificationCode'),
      inject: [ConfigService],
    },
    CloverService,
  ],
  exports: [CloverService],
})
export class CloverModule {}
