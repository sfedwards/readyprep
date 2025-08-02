import { Module } from '@nestjs/common';
import { UnitsModule } from '../units/units.module';
import { VendorItemsController } from './vendor-items.controller';
import { VendorItemsService } from './vendor-items.service';

@Module({
  imports: [UnitsModule],
  controllers: [VendorItemsController],
  providers: [VendorItemsService],
})
export class VendorItemsModule {}
