import { Module } from '@nestjs/common';
import { LocationsModule } from '../../app/locations/locations.module';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';
import { OrdersController } from './orders.controller';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { EmailsModule } from '../emails/emails.module';
import { UnitsModule } from '../units/units.module';

@Module({
  imports: [UnitsModule, LocationsModule, EmailsModule],
  controllers: [VendorsController, OrdersController, PurchaseOrdersController],
  providers: [VendorsService],
})
export class VendorsModule {}
