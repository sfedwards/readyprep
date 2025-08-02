import { Module } from '@nestjs/common';
import { UnitsService } from './units.service';
import { UnitsController } from './units.controller';
import { TransactionManagerModule } from '../transaction-manager/transaction-manager.module';
import { PaginationModule } from '../pagination/pagination.module';

@Module({
  imports: [TransactionManagerModule, PaginationModule],
  providers: [UnitsService],
  exports: [UnitsService],
  controllers: [UnitsController],
})
export class UnitsModule {}
