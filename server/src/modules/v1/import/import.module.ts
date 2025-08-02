import { Module, forwardRef } from '@nestjs/common';
import { ParserService } from './parser.service';
import { UnitsModule } from '../units/units.module';
import { ImportController } from './import.controller';
import { V1IngredientsModule } from '../ingredients/ingredients.module';
import { MenuItemsModule } from '../menu-items/menu-items.module';
import { CountingListsModule } from '@modules/app/counting-lists/counting-lists.module';

@Module({
  imports: [
    UnitsModule,
    forwardRef(() => V1IngredientsModule),
    forwardRef(() => MenuItemsModule),
    CountingListsModule,
  ],
  providers: [ParserService],
  exports: [ParserService],
  controllers: [ImportController],
})
export class ImportModule {}
