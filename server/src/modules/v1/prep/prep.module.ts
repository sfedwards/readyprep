import { Module } from '@nestjs/common';

import { V1IngredientsModule } from '../ingredients/ingredients.module';
import { InventoryModule } from '../inventory/inventory.module';
import { RecipesModule } from '../recipes/recipes.module';
import { UnitsModule } from '../units/units.module';
import { PrepController } from './prep.controller';
import { PrepService } from './prep.service';

@Module({
  imports: [InventoryModule, V1IngredientsModule, RecipesModule, UnitsModule],
  controllers: [PrepController],
  providers: [PrepService],
  exports: [PrepService],
})
export class PrepModule {}
