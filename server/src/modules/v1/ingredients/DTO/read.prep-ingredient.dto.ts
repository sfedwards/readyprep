import { toNumberOrNull } from '../../../../util/Util';
import { PantryIngredient } from '../pantry-ingredient.entity';
import { PrepIngredient } from '../prep-ingredient.entity';

export class ReadPrepIngredientRequest {}

export class ReadPrepIngredientResponse {
  constructor(
    prepIngredient: PrepIngredient,
    parRange: [number, number],
    costs: number[],
    usedIn: any[],
  ) {
    const {
      name,
      yieldPercent,
      shelfLife,
      unitConversions,
      recipe,
    } = prepIngredient;
    const { batchSize, instructions } = recipe;
    const batchUnit = recipe.batchUnit?.symbol;

    const conversions = unitConversions.map((conversion) => {
      const { amountA, amountB, unitA, unitB } = conversion;
      return {
        amountA: toNumberOrNull(amountA),
        unitA: unitA.symbol,
        amountB: toNumberOrNull(amountB),
        unitB: unitB.symbol,
      };
    });

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
      batchSize: toNumberOrNull(batchSize),
      batchUnit,
      waste: +(100 - +yieldPercent).toFixed(2),
      shelfLife: toNumberOrNull(shelfLife),
      conversions,
      ingredients,
      parRange,
      instructions,
      usedIn,
    });
  }
}
