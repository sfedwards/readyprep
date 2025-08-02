import { Module } from '@nestjs/common';

import { V1IngredientsModule } from '../ingredients/ingredients.module';
import { MenuItemsModule } from '../menu-items/menu-items.module';
import { TransactionManagerModule } from '../transaction-manager/transaction-manager.module';
import { UnitsModule } from '../units/units.module';
import { SandboxController } from './sandbox.controller';
import { SandboxService } from './sandbox.service';

@Module({
  imports: [
    V1IngredientsModule,
    MenuItemsModule,
    TransactionManagerModule,
    UnitsModule,
  ],
  providers: [SandboxService],
  exports: [SandboxService],
  controllers: [SandboxController],
})
export class SandboxModule {}
