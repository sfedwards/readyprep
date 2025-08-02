import { Module } from '@nestjs/common';
import { PantryService } from './pantry.service';
import { PantryController } from './pantry.controller';
import { PantryQueriesProvider } from './infra/pantry.queries';
import { InventoryModule } from '@modules/v1/inventory/inventory.module';

@Module({
  imports: [InventoryModule],
  providers: [PantryService, PantryQueriesProvider],
  controllers: [PantryController],
})
export class PantryModule {}
