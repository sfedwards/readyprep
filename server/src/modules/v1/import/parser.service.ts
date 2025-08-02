import { Injectable } from '@nestjs/common';

import { UnitsService } from '../units/units.service';

import parse = require('csv-parse');

interface ImportPantyIngredient {
  scopedId?: number;
  name: string;
  packPrice: number;
  packSize: number;
  packAmountPerItem: number;
  packItemUnit: string;
  waste: number;
}

interface ImportPrepIngredient {
  scopedId?: number;
  name: string;
  batchSize: number;
  batchUnit: string;
  shelfLife: number;
  waste: number;
  instructions: string;
}

interface ImportMenuItem {
  scopedId?: number;
  name: string;
  price: number;
  averageWeeklySales: number;
  instructions: string;
}

type ImportType = ImportPantyIngredient & ImportPrepIngredient & ImportMenuItem;

@Injectable()
export class ParserService {
  constructor(private readonly unitsService: UnitsService) {}

  async *parse(buffer: Buffer | string): AsyncIterable<any> {
    const iterator = parse(buffer)[Symbol.asyncIterator]();
    const header = (await iterator.next()).value;
    const keys = this.headerToKeys(header);

    for await (const record of iterator) {
      const parsedRecord = this.parseRecord(record, keys);
      if (parsedRecord.name) yield parsedRecord;
    }
  }

  private parseRecord(
    record: string[],
    keys: string[],
  ): Partial<ImportPantyIngredient> {
    return record.reduce((obj, value, column) => {
      const key = keys[column];
      if (value !== undefined && value !== '')
        obj[key] = this.transform(key, value);
      return obj;
    }, {});
  }

  headerToKeys(header: string[]): string[] {
    return header.map((column) => {
      if (/^Id\b/i.test(column)) return 'scopedId';
      if (/^name\b/i.test(column)) return 'name';
      if (/^price\b/i.test(column)) return 'packPrice';
      if (/\bpack\b/i.test(column) && /\b(per|size)\b/i.test(column))
        return 'packSize';
      if (/^amount/i.test(column)) return 'packAmountPerItem';
      if (/^(uom|unit)/i.test(column)) return 'packItemUnit';
      if (/^waste/i.test(column)) return 'waste';
      if (/^batch/i.test(column) && /\b(unit|UOM)\b/i.test(column))
        return 'batchUnit';
      if (/^batch/i.test(column)) return 'batchSize';
      if (/^shelf/i.test(column)) return 'shelfLife';
      if (/^instructions/i.test(column)) return 'instructions';
      if (/\bweekly\b/i.test(column)) return 'averageWeeklySales';
      if (/\bprice\b/i.test(column)) return 'price';
      if (/\border\b/i.test(column)) return 'orderFrequency';
    });
  }

  private transform(key: string, value: string): number | string {
    if (
      [
        'packSize',
        'waste',
        'batchSize',
        'shelfLife',
        'price',
        'averageWeeklySales',
        'orderFrequency',
      ].includes(key)
    )
      return parseFloat(value.replace(/[^\d.]/g, ''));
    if (['packPrice', 'packAmountPerItem'].includes(key))
      return value.replace(/[^\d.]/g, '');
    if (['packItemUnit', 'batchUnit'].includes(key))
      return value.replace('.', '').trim();
    return value.trim();
  }
}
