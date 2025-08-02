import { Module } from '@nestjs/common';
import { PaginatorFactoryService } from './paginator/paginator-factory.service';

@Module({
  providers: [PaginatorFactoryService],
  exports: [PaginatorFactoryService],
})
export class PaginationModule {}
