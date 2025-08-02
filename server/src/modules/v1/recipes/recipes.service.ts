import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
  BadRequestException,
} from '@nestjs/common';
import { Ingredient } from '../ingredients/ingredient.entity';
import { EntityManager, In } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { TransactionManagerService } from '../transaction-manager/transaction-manager.service';
import { RecipeIngredient } from './recipe-ingredient.entity';
import {
  onlyDefined,
  toNumberOrNull,
  toStringOrNull,
} from '../../../util/Util';

import { PrepRecipe } from './prep-recipe.entity';
import { PlatingRecipe } from './plating-recipe.entity';
import { Recipe } from './recipe.entity';
import { Account } from '../accounts/account.entity';
import { UnitsService } from '../units/units.service';
import { Unit } from '../units/unit.entity';
import { V1IngredientsService } from '../ingredients/ingredients.service';

import { Worker, spawn } from 'threads';
import { RecipesPdfDTO } from './interface/recipe-pdf';

interface RecipeSelector {
  id: Recipe['id'];
  ownerId?: Account['id'];
}

@Injectable()
export class RecipesService {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly transactionManagerService: TransactionManagerService,
    private readonly unitsService: UnitsService,
    @Inject(forwardRef(() => V1IngredientsService))
    private readonly ingredientsService: V1IngredientsService,
  ) {}

  async findOne(
    { id, ownerId }: RecipeSelector,
    manager: EntityManager = this.entityManager,
  ): Promise<Recipe> {
    const recipe = await manager.findOne(Recipe, {
      where: (qb) => {
        qb.where({ id });
        if (ownerId)
          qb.andWhere(
            'menuItem.ownerId = :ownerId OR prepIngredient.ownerId = :ownerId',
            { ownerId },
          );
      },
      join: {
        alias: 'recipe',
        leftJoin: {
          menuItem: 'recipe.menuItem',
          prepIngredient: 'recipe.prepIngredient',
        },
      },
    });

    if (!recipe) throw new NotFoundException();

    return recipe;
  }

  async getAllPrepRecipes(
    ownerId: Account['id'],
    manager: EntityManager = this.entityManager,
  ) {
    const recipes = await manager
      .createQueryBuilder()
      .select('r')
      .from(PrepRecipe, 'r')
      .leftJoin('r.prepIngredient', 'prepIngredient')
      .leftJoinAndSelect('r.batchUnit', 'batchUnit')
      .leftJoinAndSelect('r.ingredients', 'ingredients')
      .leftJoinAndSelect('ingredients.unit', 'unit')
      .leftJoinAndSelect('ingredients.ingredient', 'ingredient')
      .where('"prepIngredient"."ownerId" = :ownerId', { ownerId })
      .withDeleted()
      .getMany();
    return recipes.filter(({ deletedAt }) => !deletedAt);
  }

  async getAllRecipes(
    ownerId: Account['id'],
    manager: EntityManager = this.entityManager,
  ) {
    const recipes = await manager
      .createQueryBuilder()
      .select('r')
      .from(Recipe, 'r')
      .leftJoinAndSelect('r.prepIngredient', 'prepIngredient')
      .leftJoinAndSelect('r.menuItem', 'menuItem')
      .leftJoinAndSelect('r.batchUnit', 'batchUnit')
      .leftJoinAndSelect('r.ingredients', 'ingredients')
      .leftJoinAndSelect('ingredients.unit', 'unit')
      .leftJoinAndSelect('ingredients.ingredient', 'ingredient')
      .where(
        '"prepIngredient"."ownerId" = :ownerId OR "menuItem"."ownerId" = :ownerId',
        { ownerId },
      )
      .withDeleted()
      .getMany();
    return recipes.filter(({ deletedAt }) => !deletedAt);
  }

  async verifyOwner(
    selector: RecipeSelector,
    manager: EntityManager = this.entityManager,
  ): Promise<void> {
    await this.findOne(selector, manager);
  }

  async addIngredient(
    options: {
      id: Recipe['id'];
      ownerId?: Account['id'];
    },
    values: {
      id: Ingredient['id'];
      amount: number;
      unitSymbol: string;
      yieldPercent: number;
    },
    manager: EntityManager = this.entityManager,
  ): Promise<void> {
    const { id: recipeId, ownerId } = options;
    const { id: ingredientId, amount, unitSymbol, yieldPercent } = values;

    const unit = await this.unitsService.findByAlias({
      ownerId,
      alias: unitSymbol,
    });

    const recipeIngredient = new RecipeIngredient({
      recipeId,
      ingredientId,
      amount: toStringOrNull(amount),
      unit,
      yieldPercent: yieldPercent.toString(),
    });

    await this.transactionManagerService.ensureTransactional(
      manager,
      async (manager) => {
        const recipe = await this.findOne({ id: recipeId, ownerId });
        const ingredient = await manager.findOne(
          Ingredient,
          onlyDefined({ id: ingredientId, ownerId }),
        );

        if (!recipe || !ingredient) throw new NotFoundException();

        await manager.save(recipeIngredient);
      },
    );
  }

  async updateIngredient(
    options: {
      recipeId: Recipe['id'];
      recipeIngredientId: RecipeIngredient['id'];
      ownerId?: Account['id'];
    },
    values: Partial<{
      amount: number;
      unitId: Unit['id'];
      yieldPercent: number;
    }>,
    manager: EntityManager = this.entityManager,
  ): Promise<void> {
    const { recipeId, recipeIngredientId, ownerId } = options;
    const { amount, unitId, yieldPercent } = values;

    await this.transactionManagerService.ensureTransactional(
      manager,
      async (manager) => {
        const recipeIngredient = await manager.findOne(RecipeIngredient, {
          where: {
            id: recipeIngredientId,
            recipeId,
          },
          relations: ['recipe', 'recipe.menuItem', 'recipe.prepIngredient'],
        });

        if (
          !recipeIngredient ||
          (ownerId &&
            ownerId !== this.getRecipeOwnerId(recipeIngredient.recipe))
        )
          throw new NotFoundException();

        Object.assign(recipeIngredient, { amount, unitId, yieldPercent });
        await manager.save(recipeIngredient);
      },
    );
  }

  async removeIngredient(
    options: {
      recipeId: Recipe['id'];
      recipeIngredientId: RecipeIngredient['id'];
      ownerId?: Account['id'];
    },
    manager: EntityManager = this.entityManager,
  ): Promise<void> {
    const { recipeId, recipeIngredientId, ownerId } = options;

    await this.transactionManagerService.ensureTransactional(
      manager,
      async (manager) => {
        const recipeIngredient = await manager.findOne(RecipeIngredient, {
          where: {
            id: recipeIngredientId,
            recipeId,
          },
          relations: ['recipe', 'recipe.menuItem', 'recipe.prepIngredient'],
        });

        if (
          !recipeIngredient ||
          (ownerId &&
            ownerId !== this.getRecipeOwnerId(recipeIngredient.recipe))
        )
          throw new NotFoundException();

        await manager.softDelete(RecipeIngredient, recipeIngredientId);
      },
    );
  }

  private getRecipeOwnerId(recipe: Recipe): Account['id'] {
    if (recipe.type === PrepRecipe.name)
      return (<PrepRecipe>recipe).prepIngredient.ownerId;
    if (recipe.type === PlatingRecipe.name)
      return (<PlatingRecipe>recipe).menuItem.ownerId;
    throw new Error('Unknown Recipe Type');
  }

  public async getIngredients(
    recipe: Recipe | Recipe['id'],
    manager: EntityManager = this.entityManager,
  ) {
    return await manager.find(RecipeIngredient, {
      where: {
        [recipe instanceof Recipe ? 'recipe' : 'recipeId']: recipe,
      },
      relations: [
        'unit',
        'ingredient',
        'ingredient.recipe',
        'ingredient.recipe.batchUnit',
        'ingredient.standardUOM',
        'ingredient.defaultPack',
        'ingredient.defaultPack.itemUnit',
      ],
    });
  }

  async calculateCostM(
    { recipeId }: { recipeId: Recipe['id'] },
    ingredients: Ingredient[],
    recipes: Recipe[],
    visited: Recipe['id'][] = [],
  ): Promise<number> {
    const recipeIngredients = recipes.find(({ id }) => id === recipeId)
      .ingredients;

    return await recipeIngredients.reduce(
      async (sumPromise, recipeIngredient) => {
        const sum = await sumPromise;

        const { ingredient, amount, unit, yieldPercent } = recipeIngredient;
        const ingredientCost = await this.ingredientsService.getCostM(
          {
            ingredientId: ingredient.id,
            amount: toNumberOrNull(amount),
            unit,
            yieldPercent: toNumberOrNull(yieldPercent),
          },
          ingredients,
          recipes,
          visited,
        );

        return sum + ingredientCost;
      },
      Promise.resolve(0),
    );
  }

  async calculateCost(
    recipe: Recipe,
    manager: EntityManager = this.entityManager,
    visited: Recipe['id'][] = [],
  ): Promise<number> {
    const recipeIngredients = await this.getIngredients(recipe, manager);

    return await recipeIngredients.reduce(
      async (sumPromise, recipeIngredient) => {
        const sum = await sumPromise;

        const { ingredient, amount, unit, yieldPercent } = recipeIngredient;
        const ingredientCost = await this.ingredientsService.getCost(
          ingredient,
          toNumberOrNull(amount),
          unit,
          toNumberOrNull(yieldPercent),
          manager,
          visited,
        );

        return sum + ingredientCost;
      },
      Promise.resolve(0),
    );
  }

  async setIngredients(
    { recipeId, ownerId }: { recipeId: Recipe['id']; ownerId: Unit['ownerId'] },
    ingredients: RecipeIngredientRow[],
    manager: EntityManager = this.entityManager,
  ) {
    await manager
      .createQueryBuilder()
      .delete()
      .from(RecipeIngredient)
      .where(onlyDefined({ recipeId }))
      .execute();

    if (ingredients.length > 0) {
      const units = {};

      (
        await manager
          .getRepository(Unit)
          .createQueryBuilder()
          .select(['id', 'symbol'])
          .where((qb) => {
            qb.andWhere('("ownerId" = :ownerId OR "ownerId" IS NULL)', {
              ownerId,
            });
            qb.andWhere('"symbol" IN (:...symbols)', {
              symbols: ingredients.map(({ unit }) => unit),
            });
          })
          .execute()
      ).forEach(({ symbol, id }) => (units[symbol] = id));

      const ingredientScopedIdMap = (
        await manager.find(Ingredient, {
          select: ['id', 'scopedId'],
          where: {
            ownerId,
            scopedId: In(ingredients.map(({ id }) => id)),
          },
        })
      ).reduce((map, { id, scopedId }) => ((map[scopedId] = id), map), {});

      await manager
        .createQueryBuilder()
        .insert()
        .into(RecipeIngredient)
        .values(
          ingredients.map(({ id, amount, unit, waste }, i) => {
            if (!units[unit])
              throw new BadRequestException(`Unit "${unit}" not found`);
            if (!ingredientScopedIdMap[id])
              throw new BadRequestException(`Ingredient not found`);
            return {
              recipeId,
              ingredientId: ingredientScopedIdMap[id],
              scopedId: i + 1,
              amount: toStringOrNull(amount),
              unitId: units[unit],
              yieldPercent:
                waste === null || waste === undefined
                  ? null
                  : (100 - waste).toString(),
            };
          }),
        )
        .execute();
    }
  }

  async generateScaledRecipesPDF(
    accountId: Account['id'],
    date: string,
    data: { recipeId: PrepRecipe['id']; batches: number }[],
  ) {
    const worker = await spawn(
      new Worker('../../../workers/recipes-pdf/recipes-pdf'),
    );

    const filteredRecipes = data.filter(({ batches }) => batches);

    if (filteredRecipes.length === 0)
      return await worker.generate({ date, recipes: [] });

    const recipes = await this.entityManager
      .createQueryBuilder()
      .select([
        'r.id',
        'r.name',
        'r.batchSize',
        'r.instructions',
        'prepIngredient.name',
        'batchUnit.symbol',
        'recipeIngredient.amount',
        'ingredient.name',
        'unit.symbol',
      ])
      .from(PrepRecipe, 'r')
      .leftJoin('r.prepIngredient', 'prepIngredient')
      .leftJoin('r.batchUnit', 'batchUnit')
      .leftJoin('r.ingredients', 'recipeIngredient')
      .leftJoin('recipeIngredient.unit', 'unit')
      .leftJoin('recipeIngredient.ingredient', 'ingredient')
      .whereInIds(filteredRecipes.map(({ recipeId }) => recipeId))
      .andWhere(`"prepIngredient"."ownerId" = :accountId`, { accountId })
      .getMany();
    const pdfData: RecipesPdfDTO = {
      date,
      recipes: recipes.map((recipe) => ({
        name: recipe.prepIngredient.name,
        batches: data.find(({ recipeId }) => recipeId === recipe.id).batches,
        batchSize: +(recipe.batchSize ?? 0),
        batchUnit: recipe.batchUnit.symbol,
        instructions: recipe.instructions ?? '',
        ingredients: recipe.ingredients.map((recipeIngredient) => ({
          name: recipeIngredient.ingredient.name,
          amount: +(recipeIngredient.amount ?? 0),
          unit: recipeIngredient.unit.symbol,
        })),
      })),
    };

    return await worker.generate(pdfData);
  }
}

class RecipeIngredientRow {
  id: Ingredient['scopedId'];
  amount: number;
  unit: Unit['symbol'];
  waste?: number;
}
