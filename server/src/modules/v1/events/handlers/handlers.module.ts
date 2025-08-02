import { Module } from '@nestjs/common';
import { EmailsModule } from '@modules/v1/emails/emails.module';
import { V1IngredientsModule } from '@modules/v1/ingredients/ingredients.module';
import { InventoryModule } from '@modules/v1/inventory/inventory.module';
import { PosModule } from '@modules/v1/pos/pos.module';
import { PrepModule } from '@modules/v1/prep/prep.module';
import { RecipesModule } from '@modules/v1/recipes/recipes.module';
import { UnitsModule } from '@modules/v1/units/units.module';

import { DailyPrepReportHandler } from './daily-prep-report';
import { JobHandler } from './job';
import { SquareHandler } from './square';
import { CloverHandler } from './clover';

@Module({
  imports: [
    EmailsModule,
    PosModule,
    PrepModule,
    V1IngredientsModule,
    RecipesModule,
    UnitsModule,
    InventoryModule,
  ],
  providers: [DailyPrepReportHandler, JobHandler, SquareHandler, CloverHandler],
  exports: [DailyPrepReportHandler, JobHandler, SquareHandler, CloverHandler],
})
export class HandlersModule {}
