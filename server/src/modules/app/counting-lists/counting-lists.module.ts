import { Module } from '@nestjs/common';
import { CountingListsController } from './counting-lists.controller';
import { CountingListQueriesProvider } from './infra/counting-list.queries';
import { CountingListsService } from './counting-lists.service';
import { CountingListRepositoryProvider } from './infra/counting-list.repository';
import { UnitsModule } from '@modules/v1/units/units.module';
import { PopulateCountingListsJob } from './jobs/populate-counting-lists/populate-counting-lists.job';

@Module({
  imports: [UnitsModule],
  controllers: [CountingListsController],
  providers: [
    CountingListQueriesProvider,
    CountingListRepositoryProvider,
    CountingListsService,
    PopulateCountingListsJob,
  ],
  exports: [PopulateCountingListsJob],
})
export class CountingListsModule {}
