import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { RecipesModule } from '../recipes/recipes.module';
import { UnitsModule } from '../units/units.module';
import { InventoryController } from './inventory.controller';

@Module({
  imports: [RecipesModule, UnitsModule],
  providers: [InventoryService],
  exports: [InventoryService],
  controllers: [InventoryController],
})
export class InventoryModule {}
