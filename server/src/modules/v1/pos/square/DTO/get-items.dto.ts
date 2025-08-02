import { IsOptional } from 'class-validator';

export class SquareGetItemsRequest {
  @IsOptional()
  location?: string;
}

export class SquareGetItemsResponse {
  private items: any[];
  private modifiers: any[];

  constructor(items: any[]) {
    this.items = items.filter(({ type }) => type === 'ITEM');
    this.items.forEach((item) => {
      item.item_data.variations.forEach(this.mapLink);
    });

    this.modifiers = items.filter(({ type }) => type === 'MODIFIER');
    this.modifiers.forEach(this.mapLink);
  }

  private mapLink(variation) {
    if (variation.link) {
      const item = variation.link;

      variation.link = {
        id: item.scopedId,
        name: item.name,
      };
    }

    if (variation.match) {
      const item = variation.match;
      variation.match = {
        id: item.scopedId,
        name: item.name,
      };
    }
  }
}
