import { PantryIngredient } from '@modules/v1/ingredients/pantry-ingredient.entity';

import { toNumberOrNull } from '../../../../util/Util';
import { MenuItem } from '../menu-item.entity';

export class ReadMenuItemRequest {}

export class ReadMenuItemResponse {
  constructor(menuItem: MenuItem, costs: number[]) {
    const { name, price, averageWeeklySales, recipe } = menuItem;

    const { instructions } = recipe;

    const ingredients = recipe.ingredients.map((row, i) => {
      const { ingredient, amount, unit, yieldPercent } = row;
      return {
        id: ingredient.scopedId,
        type: ingredient.type === PantryIngredient.name ? 'pantry' : 'prep',
        name: ingredient.name,
        amount: toNumberOrNull(amount),
        unit: unit.symbol,
        waste: yieldPercent === null ? null : +(100 - +yieldPercent).toFixed(2),
        cost: costs[i],
        deleted: ingredient.deletedAt !== null,
      };
    });

    Object.assign(this, {
      name,
      price: toNumberOrNull(price),
      averageWeeklySales: toNumberOrNull(averageWeeklySales),
      instructions,
      ingredients,
    });
  }
}
