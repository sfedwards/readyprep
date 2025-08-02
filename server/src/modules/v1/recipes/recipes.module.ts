import { Module, forwardRef } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { TransactionManagerModule } from '../transaction-manager/transaction-manager.module';
import { UnitsModule } from '../units/units.module';
import { V1IngredientsModule } from '../ingredients/ingredients.module';
import { RecipesController } from './recipes.controller';

@Module({
  imports: [
    TransactionManagerModule,
    UnitsModule,
    forwardRef(() => V1IngredientsModule),
  ],
  providers: [RecipesService],
  exports: [RecipesService],
  controllers: [RecipesController],
})
export class RecipesModule {}
