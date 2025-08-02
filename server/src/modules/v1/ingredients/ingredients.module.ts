import { Module, forwardRef } from '@nestjs/common';
import { TransactionManagerModule } from '../transaction-manager/transaction-manager.module';
import { PaginationModule } from '../pagination/pagination.module';
import { PrepIngredientsController } from './prep-ingredients.controller';
import { PrepIngredientsService } from './prep-ingredients.service';
import { PantryIngredientsController } from './pantry-ingredients.controller';
import { PantryIngredientsService } from './pantry-ingredients.service';
import { RecipesModule } from '../recipes/recipes.module';
import { CoreModule } from './system/system.module';
import { ImportModule } from '../import/import.module';
import { UnitsModule } from '../units/units.module';
import { V1IngredientsService } from './ingredients.service';
import { IngredientsController } from './ingredients.controller';
import { SearchModule } from '../search/search.module';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [
    TransactionManagerModule,
    PaginationModule,
    UnitsModule,
    CoreModule,
    forwardRef(() => ImportModule),
    forwardRef(() => RecipesModule),
    SearchModule,
    PlansModule,
  ],
  controllers: [
    PrepIngredientsController,
    PantryIngredientsController,
    IngredientsController,
  ],
  providers: [
    PrepIngredientsService,
    PantryIngredientsService,
    V1IngredientsService,
  ],
  exports: [
    PrepIngredientsService,
    PantryIngredientsService,
    V1IngredientsService,
  ],
})
export class V1IngredientsModule {}
