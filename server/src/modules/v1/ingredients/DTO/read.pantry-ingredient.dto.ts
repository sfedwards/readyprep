import { PantryIngredient } from '../pantry-ingredient.entity';
import { toNumberOrNull } from '../../../../util/Util';

export class ReadPantryIngredientRequest {}

export class ReadPantryIngredientResponse {
  constructor(
    pantryIngredient: PantryIngredient,
    parLevel: number,
    usedIn: any[],
    packParLevels: number[],
  ) {
    const {
      name,
      yieldPercent,
      orderFrequency,
      systemIngredientLink,
      unitConversions,
      defaultPack,
      standardUOM,
    } = pantryIngredient;

    const packs = pantryIngredient.packs.map(
      (
        { id, vendor, catalogNumber, price, numItems, amountPerItem, itemUnit },
        i,
      ) => ({
        id,
        catalogNumber,
        price: toNumberOrNull(price),
        numItems: toNumberOrNull(numItems),
        amountPerItem: toNumberOrNull(amountPerItem),
        unit: {
          name: itemUnit?.name,
          symbol: itemUnit?.symbol,
        },
        vendor: vendor
          ? {
              id: vendor.id,
              name: vendor.name,
            }
          : null,
        isDefault: defaultPack?.id === id,
        par: packParLevels[i],
      }),
    );

    const conversions = unitConversions.map((conversion) => {
      const { amountA, amountB, unitA, unitB } = conversion;
      return {
        amountA: toNumberOrNull(amountA),
        unitA: unitA.symbol,
        amountB: toNumberOrNull(amountB),
        unitB: unitB.symbol,
      };
    });

    Object.assign(this, {
      name,
      packs,
      waste: yieldPercent === null ? null : +(100 - +yieldPercent).toFixed(2),
      orderFrequency,
      systemIngredientLink: systemIngredientLink?.name,
      conversions,
      parLevel,
      usedIn,
      unit: standardUOM,
    });
  }
}
