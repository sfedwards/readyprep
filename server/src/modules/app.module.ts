import { ConfigModule } from '@nestjs/config';

import { APP_GUARD } from '@nestjs/core';
import { AccountsModule } from './v1/accounts/accounts.module';
import { AppService } from './app.service';
import { AuthModule } from './v1/auth/auth.module';
import { BillingModule } from './v1/billing/billing.module';
import { EmailsModule } from './v1/emails/emails.module';
import { EventsModule } from './v1/events/events.module';
import { ImportModule } from './v1/import/import.module';
import { V1IngredientsModule } from './v1/ingredients/ingredients.module';
import { InventoryModule } from './v1/inventory/inventory.module';
import { InvoicesModule } from './v1/invoices/invoices.module';
import { JobsModule } from './v1/jobs/jobs.module';
import { JwtModule } from './v1/jwt/jwt.module';
import { LocationsModule } from './app/locations/locations.module';
import { MenuItemsModule } from './v1/menu-items/menu-items.module';
import { MenusModule } from './v1/menus/menus.module';
import { Module } from '@nestjs/common';
import { PlanGuard } from './v1/plans/plan.guard';
import { PlansModule } from './v1/plans/plans.module';
import { PosModule } from './v1/pos/pos.module';
import { PrepModule } from './v1/prep/prep.module';
import { RecipesModule } from './v1/recipes/recipes.module';
import { SandboxModule } from './v1/sandbox/sandbox.module';
import { SearchModule } from './v1/search/search.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TransactionManagerModule } from './v1/transaction-manager/transaction-manager.module';
import { TransactionManagerService } from './v1/transaction-manager/transaction-manager.service';
import { UnitsModule } from './v1/units/units.module';
import { UsersModule } from './v1/users/users.module';
import { VendorItemsModule } from './v1/vendor-items/vendor-items.module';
import { VendorsModule } from './v1/vendors/vendors.module';
import { CountsModule } from './app/counts/counts.module';
import { SegmentModule } from './v1/segment/segment.module';
import configs from '../config';

import path = require('path');
import { InfraModule } from '@modules/infra/infra.module';
import { PantryModule } from './app/pantry/pantry.module';
import { CountingListsModule } from './app/counting-lists/counting-lists.module';
import { IngredientsModule } from './app/ingredients/ingredients.module';

export const CLIENT_PATH =
  process.env.NODE_ENV === 'development'
    ? path.join(__dirname, '../../../../client/build')
    : path.join(__dirname, '../../../client');

@Module({
  imports: [
    V1IngredientsModule,
    PantryModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
    }),
    InfraModule,
    ServeStaticModule.forRoot({
      rootPath: CLIENT_PATH,
      serveStaticOptions: {
        setHeaders: (res: any, path: string) => {
          if (path.startsWith(CLIENT_PATH + '/static/'))
            res.setHeader(
              'Cache-Control',
              'public, max-age=30100100, immutable',
            );
        },
      },
    }),
    AuthModule,
    UsersModule,
    AccountsModule,
    BillingModule,
    PlansModule,
    MenusModule,
    RecipesModule,
    TransactionManagerModule,
    EmailsModule,
    JwtModule,
    MenuItemsModule,
    UnitsModule,
    ImportModule,
    SearchModule,
    PosModule,
    EventsModule,
    LocationsModule,
    InventoryModule,
    PrepModule,
    JobsModule,
    SandboxModule,
    VendorsModule,
    VendorItemsModule,
    InvoicesModule,
    CountsModule,
    CountingListsModule,
    IngredientsModule,
    SegmentModule,
  ],
  providers: [
    AppService,
    TransactionManagerService,
    {
      provide: APP_GUARD,
      useClass: PlanGuard,
    },
  ],
})
export class AppModule {}
