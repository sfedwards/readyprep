import {
  Injectable,
  Inject,
  forwardRef,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { TransactionManagerService } from '../transaction-manager/transaction-manager.service';
import { RecipesService } from '../recipes/recipes.service';
import { UnitsService } from '../units/units.service';
import { Ingredient } from './ingredient.entity';
import { RecipeIngredient } from '../recipes/recipe-ingredient.entity';
import { PantryIngredient } from './pantry-ingredient.entity';
import { PlatingRecipe } from '../recipes/plating-recipe.entity';
import { PrepIngredient } from './prep-ingredient.entity';
import { PrepRecipe } from '../recipes/prep-recipe.entity';
import { Unit } from '../units/unit.entity';
import { UnitConversion } from '../units/unit-conversion.entity';
import { onlyDefined, toStringOrNull } from '../../../util/Util';
import { Recipe } from '../recipes/recipe.entity';
import { SearchService } from '../search/search.service';

@Injectable()
export class V1IngredientsService {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    @Inject(forwardRef(() => RecipesService))
    private readonly recipesService: RecipesService,
    private readonly unitsService: UnitsService,
    private readonly transactionManagerService: TransactionManagerService,
    private readonly searchService: SearchService,
  ) {}

  async findOneWithComponents(
    ownerId: Ingredient['ownerId'],
    id: Ingredient['scopedId'],
    manager: EntityManager = this.entityManager,
  ): Promise<Ingredient> {
    return await manager.findOne(Ingredient, {
      where: { ownerId, scopedId: id },
      relations: [
        'standardUOM',
        'defaultPack',
        'defaultPack.itemUnit',
        'unitConversions',
        'unitConversions.unitA',
        'unitConversions.unitB',
        'recipe',
        'recipe.batchUnit',
        'recipe.ingredients',
        'recipe.ingredients.ingredient',
        'recipe.ingredients.unit',
      ],
      withDeleted: true,
    });
  }

  async getAllIngredients(
    ownerId: Ingredient['ownerId'],
    manager: EntityManager = this.entityManager,
  ): Promise<Ingredient[]> {
    const ingredients = await manager.find(Ingredient, {
      where: { ownerId },
      relations: [
        'defaultPack',
        'defaultPack.itemUnit',
        'unitConversions',
        'unitConversions.unitA',
        'unitConversions.unitB',
        'recipe',
        'recipe.batchUnit',
      ],
      withDeleted: true,
    });
    return ingredients.filter(({ deletedAt }) => !deletedAt);
  }

  async find(
    { ownerId, query }: { ownerId: Ingredient['ownerId']; query?: string },
    manager: EntityManager = this.entityManager,
  ): Promise<Ingredient[]> {
    return await this.searchService.find(
      Ingredient,
      ownerId,
      query,
      undefined,
      manager,
    );
  }

  async delete(
    options: {
      id: PrepIngredient['scopedId'];
      ownerId?: PrepIngredient['ownerId'];
    },
    manager: EntityManager = this.entityManager,
  ): Promise<void> {
    const { id: scopedId, ownerId } = options;

    return await this.transactionManagerService.ensureTransactional(
      manager,
      async (manager) => {
        const {
          affected,
          raw: [{ id: ingredientId }],
        } = await manager
          .getRepository(Ingredient)
          .createQueryBuilder()
          .softDelete()
          .returning('id')
          .where(onlyDefined({ scopedId, ownerId, deletedAt: null }))
          .execute();
        if (affected === 0) throw new NotFoundException();

        await manager.softDelete(RecipeIngredient, { ingredientId });
        await manager.softDelete(UnitConversion, { ingredientId });
      },
      'REPEATABLE READ',
    );
  }

  async calculateDailyUsageM(
    {
      ingredient,
      unit,
    }: {
      ingredient: Ingredient;
      unit: Unit;
    },
    ingredients: Ingredient[],
    recipes: Recipe[],
    visited: Ingredient['id'][] = [],
  ) {
    const recipeIngredients = recipes.flatMap((recipe) =>
      recipe.ingredients.filter(
        ({ ingredientId }) => ingredientId === ingredient.id,
      ),
    );

    const [usage, usedIn] = await recipeIngredients.reduce(
      async (accumulatorPromise, recipeIngredient) => {
        const [sum, usedIn] = await accumulatorPromise;

        const ingredient = ingredients.find(
          ({ id }) => id === recipeIngredient.ingredientId,
        );
        const recipe = recipes.find(
          ({ id }) => id === recipeIngredient.recipeId,
        );

        const yieldPercent =
          (+(ingredient.yieldPercent ?? 100) *
            +(recipeIngredient.yieldPercent ?? 100)) /
          100 ** (2 - 1);

        const ingredientAmount = await (async () => {
          if (recipe.type === PlatingRecipe.name) {
            const menuItem = (<PlatingRecipe>recipe).menuItem;

            const dailySales = +menuItem.averageWeeklySales / 7;

            const amount = await this.unitsService.convertM(
              {
                ingredient,
                amount: (+recipeIngredient.amount * 100) / +yieldPercent,
                fromUnit: recipeIngredient.unit,
                toUnit: unit,
              },
              ingredient.unitConversions,
            );

            usedIn.push({
              id: menuItem.scopedId,
              type: 'item',
              name: menuItem.name,
            });

            return amount * dailySales;
          }

          const { prepIngredient } = <PrepRecipe>recipe;

          if (!prepIngredient || prepIngredient.deletedAt) return 0;

          if (visited.includes(prepIngredient.id))
            throw new Error('Circular Prep Reference');

          const [
            dailyUsageInBatchUnit,
            usedInForPrep,
          ] = await this.calculateDailyUsageM(
            {
              ingredient: prepIngredient,
              unit: prepIngredient.recipe.batchUnit,
            },
            ingredients,
            recipes,
            [prepIngredient.id, ...visited],
          );
          const dailyBatches =
            dailyUsageInBatchUnit / +prepIngredient.recipe.batchSize;

          usedIn.push({
            id: prepIngredient.scopedId,
            type: 'prep',
            name: prepIngredient.name,
          });
          usedIn.push(...usedInForPrep);

          return await this.unitsService.convertM(
            {
              ingredient,
              amount:
                (+recipeIngredient.amount * dailyBatches * 100) / +yieldPercent,
              fromUnit: recipeIngredient.unit,
              toUnit: unit,
            },
            ingredient.unitConversions,
          );
        })();

        return [sum + ingredientAmount, usedIn] as [
          number,
          { type: string; id: number; name: string }[],
        ];
      },
      Promise.resolve([0, []] as [
        number,
        { type: string; id: number; name: string }[],
      ]),
    );

    return [
      usage,
      usedIn
        .filter(
          (a, i) =>
            usedIn
              .slice(i + 1)
              .findIndex((b) => a.type === b.type && a.id === b.id) === -1,
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    ];
  }

  async calculateDailyUsage(
    ingredient: Ingredient,
    unit: Unit,
    manager: EntityManager = this.entityManager,
    visited: Ingredient['id'][] = [],
  ): Promise<[number, { type: string; id: number; name: string }[]]> {
    const recipeIngredients = await manager.find(RecipeIngredient, {
      where: {
        ingredient,
      },
      relations: [
        'unit',
        'recipe',
        'recipe.prepIngredient',
        'recipe.prepIngredient.recipe',
        'recipe.prepIngredient.recipe.batchUnit',
        'ingredient',
        'recipe.menuItem',
        'ingredient.recipe',
        'ingredient.recipe.batchUnit',
      ],
    });

    const [usage, usedIn] = await recipeIngredients.reduce(
      async (accumulatorPromise, recipeIngredient) => {
        const [sum, usedIn] = await accumulatorPromise;

        const { recipe, ingredient } = recipeIngredient;
        const yieldPercent =
          (+(ingredient.yieldPercent ?? 100) *
            +(recipeIngredient.yieldPercent ?? 100)) /
          100 ** (2 - 1);

        const ingredientAmount = await (async () => {
          if (recipe.type === PlatingRecipe.name) {
            const menuItem = (<PlatingRecipe>recipe).menuItem;

            if (!menuItem || menuItem.deletedAt) return 0;

            const dailySales = +menuItem.averageWeeklySales / 7;

            const amount = await this.unitsService.convert(
              {
                ingredient,
                amount: (+recipeIngredient.amount * 100) / +yieldPercent,
              },
              recipeIngredient.unit,
              unit,
              manager,
            );

            usedIn.push({
              id: menuItem.scopedId,
              type: 'item',
              name: menuItem.name,
            });

            return amount * dailySales;
          }

          const { prepIngredient } = <PrepRecipe>recipe;

          if (!prepIngredient || prepIngredient.deletedAt) return 0;

          if (visited.includes(prepIngredient.id))
            throw new Error('Circular Prep Reference');

          const [
            dailyUsageInBatchUnit,
            usedInForPrep,
          ] = await this.calculateDailyUsage(
            prepIngredient,
            prepIngredient.recipe.batchUnit,
            manager,
            [prepIngredient.id, ...visited],
          );
          const dailyBatches =
            dailyUsageInBatchUnit / +prepIngredient.recipe.batchSize;

          usedIn.push({
            id: prepIngredient.scopedId,
            type: 'prep',
            name: prepIngredient.name,
          });
          usedIn.push(...usedInForPrep);

          return await this.unitsService.convert(
            {
              ingredient,
              amount:
                (+recipeIngredient.amount * dailyBatches * 100) / +yieldPercent,
            },
            recipeIngredient.unit,
            unit,
            manager,
          );
        })();

        return [sum + ingredientAmount, usedIn] as [
          number,
          { type: string; id: number; name: string }[],
        ];
      },
      Promise.resolve([0, []] as [
        number,
        { type: string; id: number; name: string }[],
      ]),
    );

    return [
      usage,
      usedIn
        .filter(
          (a, i) =>
            usedIn
              .slice(i + 1)
              .findIndex((b) => a.type === b.type && a.id === b.id) === -1,
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    ];
  }

  async getCostM(
    input: {
      ingredientId: Ingredient['id'];
      amount: number;
      unit: Unit;
      yieldPercent?: number;
    },
    ingredients: Ingredient[],
    recipes: Recipe[],
    visited: Recipe['id'][] = [],
  ) {
    const { ingredientId, amount, unit } = input;
    const ingredient = ingredients.find(({ id }) => id === ingredientId);
    const yieldPercent =
      (+(input.yieldPercent ?? 100) * +(ingredient.yieldPercent ?? 100)) /
      100 ** (2 - 1);

    if (ingredient.type === PantryIngredient.name) {
      const pantryIngredient = <PantryIngredient>ingredient;

      const pack = pantryIngredient.defaultPack;
      const { price, numItems, amountPerItem, itemUnit } = pack;

      if (!unit) return;

      const convertedAmount = await this.unitsService.convertM(
        {
          ingredient,
          amount: (amount * 100) / yieldPercent,
          fromUnit: unit,
          toUnit: itemUnit,
        },
        ingredient.unitConversions,
      );

      return (convertedAmount * +price) / +(numItems || 1) / +amountPerItem;
    }

    const prepIngredient = <PrepIngredient>ingredient;
    const prepRecipe = recipes.find(
      ({ id }) => id === prepIngredient.recipeId,
    ) as PrepRecipe;
    if (visited.includes(prepRecipe.id))
      throw new Error('Circular Prep Reference');

    if (prepRecipe.batchSize == null || prepRecipe.batchUnit == null) return;

    const batchCost = await this.recipesService.calculateCostM(
      {
        recipeId: prepRecipe.id,
      },
      ingredients,
      recipes,
      [prepRecipe.id, ...visited],
    );

    const convertedAmount = await this.unitsService.convertM(
      {
        ingredient,
        amount: (amount * 100) / yieldPercent,
        fromUnit: unit,
        toUnit: prepRecipe.batchUnit,
      },
      ingredient.unitConversions,
    );

    return (convertedAmount * batchCost) / +prepRecipe.batchSize;
  }

  async getCost(
    ingredient: Ingredient,
    amount: number,
    unit: Unit,
    yieldPercent?: number,
    manager: EntityManager = this.entityManager,
    visited: Recipe['id'][] = [],
  ) {
    yieldPercent =
      (+(yieldPercent ?? 100) * +(ingredient.yieldPercent ?? 100)) /
      100 ** (2 - 1);

    if (ingredient.type === PantryIngredient.name) {
      const pantryIngredient = <PantryIngredient>ingredient;

      const pack = pantryIngredient.defaultPack;

      if (!pack) return;

      const { price, numItems, amountPerItem, itemUnit } = pack;

      if (!itemUnit) return;

      const convertedAmount = await this.unitsService.convert(
        {
          ingredient,
          amount: (amount * 100) / yieldPercent,
        },
        unit,
        itemUnit,
        manager,
      );

      return (convertedAmount * +price) / +(numItems || 1) / +amountPerItem;
    }

    const prepIngredient = <PrepIngredient>ingredient;
    const prepRecipe = prepIngredient.recipe;
    if (visited.includes(prepRecipe.id))
      throw new Error('Circular Prep Reference');

    if (prepRecipe.batchSize == null || prepRecipe.batchUnit == null) return;

    const batchCost = await this.recipesService.calculateCost(
      prepRecipe,
      manager,
      [prepRecipe.id, ...visited],
    );

    const convertedAmount = await this.unitsService.convert(
      {
        ingredient,
        amount: (amount * 100) / yieldPercent,
      },
      unit,
      prepRecipe.batchUnit,
      manager,
    );

    return (convertedAmount * batchCost) / +prepRecipe.batchSize;
  }

  async setConversions(
    {
      ingredientId,
      ownerId,
    }: { ingredientId: Ingredient['id']; ownerId: Unit['ownerId'] },
    conversions: Conversion[],
    manager: EntityManager = this.entityManager,
  ) {
    await manager
      .createQueryBuilder()
      .delete()
      .from(UnitConversion)
      .where(onlyDefined({ ingredientId }))
      .execute();

    const units = {};
    await Promise.all(
      conversions.map(async ({ unitA, unitB }) => {
        if (!units[unitA])
          units[unitA] = await this.unitsService.findByAlias({
            ownerId,
            alias: unitA,
          });
        if (!units[unitB])
          units[unitB] = await this.unitsService.findByAlias({
            ownerId,
            alias: unitB,
          });
      }),
    );

    if (conversions.length > 0) {
      await manager
        .createQueryBuilder()
        .insert()
        .into(UnitConversion)
        .values(
          conversions.map(({ amountA, unitA, amountB, unitB }, i) => {
            return {
              ingredientId,
              scopedId: i + 1,
              amountA: toStringOrNull(amountA),
              unitA: units[unitA],
              amountB: toStringOrNull(amountB),
              unitB: units[unitB],
            };
          }),
        )
        .execute();
    }
  }

  async getUsage({
    id,
    ownerId,
  }: {
    id: Unit['scopedId'];
    ownerId: Unit['ownerId'];
  }) {
    const ingredient = await this.entityManager.findOne(Ingredient, {
      where: { scopedId: id, ownerId },
      select: ['id'],
    });

    const recipes = await this.entityManager
      .createQueryBuilder()
      .addSelect('"prepIngredient"."scopedId"', 'prepId')
      .addSelect('"prepIngredient"."name"', 'prepName')
      .addSelect('"menuItem"."scopedId"', 'itemId')
      .addSelect('"menuItem"."name"', 'itemName')
      .from(RecipeIngredient, 'recipeIngredient')
      .leftJoin('recipeIngredient.recipe', 'recipe')
      .leftJoin('recipe.prepIngredient', 'prepIngredient')
      .leftJoin('recipe.menuItem', 'menuItem')
      .where({ ingredient: ingredient })
      .execute();
    return {
      recipes: recipes.map((recipe) => ({
        type: recipe.prepId ? 'prep' : 'items',
        id: recipe.prepId ?? recipe.itemId,
        name: recipe.prepName ?? recipe.itemName,
      })),
    };
  }
}

class Conversion {
  amountA: number;
  unitA: string;
  amountB: number;
  unitB: string;
}
