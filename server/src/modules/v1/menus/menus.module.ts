import { Module } from '@nestjs/common';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';
import { TransactionManagerModule } from '../transaction-manager/transaction-manager.module';
import { PaginationModule } from '../pagination/pagination.module';
import { MenuItemsModule } from '../menu-items/menu-items.module';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [
    TransactionManagerModule,
    PaginationModule,
    MenuItemsModule,
    PlansModule,
  ],
  controllers: [MenusController],
  providers: [MenusService],
})
export class MenusModule {}
