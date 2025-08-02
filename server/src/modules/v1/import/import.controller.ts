import {
  Controller,
  UseInterceptors,
  UseGuards,
  Post,
  UploadedFile,
  Session,
  Get,
  Header,
  Response,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LoggedInGuard } from '../auth/logged-in.guard';

import XLSX = require('xlsx');
import { ParserService } from './parser.service';
import { PantryIngredientsService } from '../ingredients/pantry-ingredients.service';
import { PrepIngredientsService } from '../ingredients/prep-ingredients.service';
import { MenuItemsService } from '../menu-items/menu-items.service';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { PantryIngredient } from '../ingredients/pantry-ingredient.entity';
import { PrepIngredient } from '../ingredients/prep-ingredient.entity';
import { MenuItem } from '../menu-items/menu-item.entity';

import * as instructionsData from './data/instructions.json';
import { PopulateCountingListsJob } from '@modules/app/counting-lists/jobs/populate-counting-lists/populate-counting-lists.job';
import { LocationId } from '@domain/location';

const HEADERS = {
  PANTRY: [
    'Name',
    'Price Per Package/Case',
    'Units per Pack',
    'Amount per Unit',
    'UOM (for item)',
    'Waste %',
    'Order Frequency',
  ],
  PREP: [
    'Name',
    'Batch Size',
    'Batch Size UOM',
    'Shelf Life (days)',
    'Waste %',
  ],
  MENU_ITEMS: ['Name', 'Sales Price ($)', 'Avg. Weekly Sales'],
};

@Controller('')
export class ImportController {
  constructor(
    private readonly parserService: ParserService,
    private readonly pantryIngredientsService: PantryIngredientsService,
    private readonly prepIngredientsService: PrepIngredientsService,
    private readonly menuItemsService: MenuItemsService,
    private readonly populateCountingListsJob: PopulateCountingListsJob,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  @Post('import')
  @UseGuards(LoggedInGuard)
  @UseInterceptors(FileInterceptor('file'))
  async import(
    @UploadedFile() { buffer },
    @Session() { accountId: ownerId, locationId },
  ): Promise<void> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const sheetType = this.identifySheetByHeaders(sheet);

      if (sheetName === 'Pantry Ingredients' || sheetType === 'pantry') {
        await this.pantryIngredientsService.importCsv(
          ownerId,
          XLSX.utils.sheet_to_csv(sheet),
        );
      } else if (sheetName === 'Prep Ingredients' || sheetType === 'prep') {
        await this.prepIngredientsService.importCsv(
          ownerId,
          XLSX.utils.sheet_to_csv(sheet),
        );
      } else if (sheetName === 'Menu Items' || sheetType === 'menuItems') {
        await this.menuItemsService.importCsv(
          ownerId,
          XLSX.utils.sheet_to_csv(sheet),
        );
      } else if (sheetName === 'Instructions') {
        // Skip
      } else {
        console.warn(`Unrecognized Import Sheet Format. Name: ${sheetName}`);
      }
    }

    void this.populateCountingListsJob
      .run(LocationId.from(locationId))
      .catch(console.log);
  }

  @Get('export')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @UseGuards(LoggedInGuard)
  async export(
    @Session() { accountId: ownerId },
    @Response() res,
  ): Promise<void> {
    const workbook = XLSX.utils.book_new();

    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
    instructionsSheet['!cols'] = [
      { width: 38 },
      { width: 0, hidden: true },
      { width: 100 },
    ];
    instructionsSheet['!merges'] = instructionsData.flatMap((row, i) => {
      if (row.filter(Boolean).length === 1)
        return [{ s: { c: 0, r: i }, e: { c: row.length, r: i } }];
      return [];
    });
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

    const pantryIngedients = await this.entityManager.find(PantryIngredient, {
      where: { ownerId },
      order: { scopedId: 'ASC' },
      relations: ['packs', 'packs.itemUnit'],
    });
    const pantryData = pantryIngedients.map((ingredient) => {
      const {
        scopedId,
        name,
        packs: [pack],
        yieldPercent,
      } = ingredient;
      return [
        scopedId,
        name,
        pack.price,
        pack.numItems,
        pack.amountPerItem,
        pack.itemUnit?.symbol || '',
        100 - +yieldPercent,
        ingredient.orderFrequency,
      ];
    });
    const pantryHeader = [
      ...(pantryData.length > 0 ? ['Id. (do not change)'] : []),
      ...HEADERS.PANTRY,
    ];
    const pantrySheet = XLSX.utils.aoa_to_sheet([pantryHeader, ...pantryData]);
    pantrySheet['!cols'] = pantryHeader.map(() => ({ width: 20 }));
    pantrySheet['!cols'][1].width = 30;
    XLSX.utils.book_append_sheet(workbook, pantrySheet, 'Pantry Ingredients');

    const prepIngedients = await this.entityManager.find(PrepIngredient, {
      where: { ownerId },
      order: { scopedId: 'ASC' },
      relations: ['recipe', 'recipe.batchUnit'],
    });
    const prepData = prepIngedients.map((ingredient) => {
      const { scopedId, name, shelfLife, recipe, yieldPercent } = ingredient;
      return [
        scopedId,
        name,
        recipe.batchSize,
        recipe.batchUnit?.symbol || '',
        shelfLife,
        100 - +yieldPercent,
      ];
    });
    const prepHeader = [
      ...(prepData.length > 0 ? ['Id. (do not change)'] : []),
      ...HEADERS.PREP,
    ];
    const prepSheet = XLSX.utils.aoa_to_sheet([prepHeader, ...prepData]);
    prepSheet['!cols'] = prepHeader.map(() => ({ width: 20 }));
    prepSheet['!cols'][1].width = 30;
    XLSX.utils.book_append_sheet(workbook, prepSheet, 'Prep Ingredients');

    const menuItems = await this.entityManager.find(MenuItem, {
      where: { ownerId },
      order: { scopedId: 'ASC' },
      relations: ['recipe'],
    });
    const menuItemsData = menuItems.map((menuItem) => {
      const { scopedId, name, price, averageWeeklySales } = menuItem;
      return [scopedId, name, price, averageWeeklySales];
    });
    const menuItemsHeader = [
      ...(menuItemsData.length > 0 ? ['Id. (do not change)'] : []),
      ...HEADERS.MENU_ITEMS,
    ];
    const menuItemsSheet = XLSX.utils.aoa_to_sheet([
      menuItemsHeader,
      ...menuItemsData,
    ]);
    menuItemsSheet['!cols'] = menuItemsHeader.map(() => ({ width: 20 }));
    menuItemsSheet['!cols'][1].width = 30;
    XLSX.utils.book_append_sheet(workbook, menuItemsSheet, 'Menu Items');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.send(buffer);
  }

  private identifySheetByHeaders(
    sheet: XLSX.Sheet,
  ): 'pantry' | 'prep' | 'menuItems' | false {
    const headers = Object.entries(sheet)
      .filter(([k]) => /^[A-Z]+1$/.test(k))
      .map(([, { v }]) => v);
    const keys = this.parserService.headerToKeys(headers);

    const matchBits = [
      this.matchesPanty(keys),
      this.matchesPrep(keys),
      this.matchesMenuItem(keys),
    ]
      .map(Number)
      .join('');

    const type = ({
      '100': 'pantry',
      '010': 'prep',
      '001': 'menuItems',
    } as const)[matchBits];

    return type || false;
  }

  private matchesPanty(keys: string[]): boolean {
    return keys.every((key) =>
      this.parserService.headerToKeys(HEADERS.PANTRY).includes(key),
    );
  }

  private matchesPrep(keys: string[]): boolean {
    return keys.every((key) =>
      this.parserService.headerToKeys(HEADERS.PREP).includes(key),
    );
  }

  private matchesMenuItem(keys: string[]): boolean {
    return keys.every((key) =>
      this.parserService.headerToKeys(HEADERS.MENU_ITEMS).includes(key),
    );
  }
}
