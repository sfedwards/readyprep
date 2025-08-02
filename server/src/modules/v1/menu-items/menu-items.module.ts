import { Module, forwardRef } from '@nestjs/common';
import { MenuItemsController } from './menu-items.controller';
import { TransactionManagerModule } from '../transaction-manager/transaction-manager.module';
import { PaginationModule } from '../pagination/pagination.module';
import { MenuItemsService } from './menu-items.service';
import { RecipesModule } from '../recipes/recipes.module';
import { ImportModule } from '../import/import.module';
import { V1IngredientsModule } from '../ingredients/ingredients.module';
import { SearchModule } from '../search/search.module';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [
    TransactionManagerModule,
    PaginationModule,
    forwardRef(() => V1IngredientsModule),
    forwardRef(() => RecipesModule),
    forwardRef(() => ImportModule),
    SearchModule,
    PlansModule,
  ],
  controllers: [MenuItemsController],
  providers: [MenuItemsService],
  exports: [MenuItemsService],
})
export class MenuItemsModule {}
