import { Module } from '@nestjs/common';

import { EmailsModule } from '../emails/emails.module';
import { InventoryModule } from '../inventory/inventory.module';
import { PosModule } from '../pos/pos.module';
import { PrepModule } from '../prep/prep.module';
import { HandlersModule } from './handlers/handlers.module';
import { PollerService } from './poller.service';

@Module({
  imports: [
    EmailsModule,
    InventoryModule,
    PosModule,
    PrepModule,
    HandlersModule,
  ],
  providers: [PollerService],
  exports: [PollerService],
})
export class EventsModule {}
