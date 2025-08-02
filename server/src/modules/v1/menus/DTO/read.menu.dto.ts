import { toNumberOrNull } from '../../../../util/Util';
import { Menu } from '../menu.entity';

export class ReadMenuRequest {}

export class ReadMenuResponse {
  constructor(menu: Menu, costs: Record<number, number>) {
    const { name, sections } = menu;

    const formattedSections = sections.map(({ name, items }) => ({
      name,
      items: items.map(({ name, price, scopedId, id }) => ({
        id: scopedId,
        name,
        price: toNumberOrNull(price),
        cost: costs[id],
      })),
    }));

    Object.assign(this, {
      name,
      sections: formattedSections,
    });
  }
}
