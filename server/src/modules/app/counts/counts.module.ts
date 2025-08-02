import { Module } from '@nestjs/common';
import { CountsController } from './counts.controller';
import { CountsService } from './counts.service';
import { CountQueries } from '@domain/count';
import { CountQueriesProvider } from './infra';
import { CountRepositoryProvider } from './infra/count.repository';
import { V1IngredientsModule } from '@modules/v1/ingredients/ingredients.module';
import { PdfController } from './pdf.controller';

@Module({
  imports: [V1IngredientsModule],
  controllers: [CountsController, PdfController],
  providers: [CountsService, CountQueriesProvider, CountRepositoryProvider],
  exports: [CountsService, CountQueries],
})
export class CountsModule {}
