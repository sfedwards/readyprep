import { UnitsModule } from '@modules/v1/units/units.module';
import { Module } from '@nestjs/common';
import { CountingListQueriesProvider } from '../counting-lists/infra/counting-list.queries';
import { IngredientsController } from './ingredients.controller';
import { IngredientQueriesProvider } from './infra/ingredients.queries';
import { V1IngredientsModule } from '@modules/v1/ingredients/ingredients.module';
import { IngredientsService } from './ingredients.service';

@Module({
  imports: [V1IngredientsModule, UnitsModule],
  controllers: [IngredientsController],
  providers: [
    CountingListQueriesProvider,
    IngredientQueriesProvider,
    IngredientsService,
  ],
})
export class IngredientsModule {}
