import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { Module } from '@nestjs/common';
import { UnitsModule } from '../units/units.module';
import { LocationsModule } from '../../app/locations/locations.module';

@Module({
  imports: [UnitsModule, LocationsModule],
  providers: [InvoicesService],
  controllers: [InvoicesController],
})
export class InvoicesModule {}
