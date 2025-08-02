import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, In, Like } from 'typeorm';
import { PrepIngredient } from './prep-ingredient.entity';
import {
  PaginatedRequest,
  PaginatedResponse,
} from '../pagination/DTO/pagination.dto';
import { PaginatorFactoryService } from '../pagination/paginator/paginator-factory.service';
import { TransactionManagerService } from '../transaction-manager/transaction-manager.service';

import { onlyDefined, omitEmpty } from '../../../util/Util';
import { PrepRecipe } from '../recipes/prep-recipe.entity';
import { Ingredient } from './ingredient.entity';
import { RecipesService } from '../recipes/recipes.service';
import { Account } from '../accounts/account.entity';
import { ParserService } from '../import/parser.service';
import { UnitsService } from '../units/units.service';
import { Unit } from '../units/unit.entity';
import { UpdatePrepIngredientRequest } from './DTO/update.prep-ingredient.dto';
import { V1IngredientsService } from './ingredients.service';
import _ = require('lodash');
import { CreatePrepIngredientRequest } from './DTO/create.prep-ingredient.dto';
import PostgresErrorCode from '../../../util/PostgresErrors';
import { Recipe } from '../recipes/recipe.entity';

@Injectable()
export class PrepIngredientsService {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly transactionManagerService: TransactionManagerService,
    private readonly paginatorFactoryService: PaginatorFactoryService,
    private readonly recipesService: RecipesService,
    private readonly csvParserService: ParserService,
    private readonly unitsService: UnitsService,
    private readonly ingredientsService: V1IngredientsService,
  ) {}

  async create(
    ownerId: PrepIngredient['ownerId'],
    values: {
      name: PrepIngredient['name'];
      yieldPercent?: PrepIngredient['yieldPercent'];
      batchSize?: PrepRecipe['batchSize'];
      unitSymbol?: string;
      unit?: Unit;
      shelfLife?: PrepIngredient['shelfLife'];
      instructions?: PrepRecipe['instructions'];
      scopedId?: PrepIngredient['scopedId'];
      conversions?: CreatePrepIngredientRequest['conversions'];
      ingredients?: CreatePrepIngredientRequest['ingredients'];
    },
    manager: EntityManager = this.entityManager,
  ): Promise<PrepIngredient> {
    const {
      name,
      yieldPercent,
      unitSymbol,
      batchSize,
      shelfLife,
      instructions,
      scopedId,
      conversions,
      ingredients,
    } = values;

    const unit =
      values.unit ||
      (unitSymbol &&
        (await this.unitsService.findByAlias({ ownerId, alias: unitSymbol })));

    const recipe = new PrepRecipe({
      batchSize,
      batchUnit: unit,
      instructions,
    });

    const prepIngredient = new PrepIngredient({
      name,
      ownerId,
      recipe,
      yieldPercent,
      shelfLife,
    });

    try {
      return await this.transactionManagerService.ensureTransactional(
        manager,
        async (manager) => {
          if (!scopedId) {
            const { maxId } = await manager
              .getRepository(Ingredient)
              .createQueryBuilder()
              .select('MAX("scopedId") "maxId"')
              .withDeleted()
              .where('"ownerId" = :ownerId', { ownerId })
              .getRawOne();
            prepIngredient.scopedId = (maxId || 0) + 1;
          }
          await manager.save(recipe);
          await manager.save(prepIngredient);

          if (conversions?.length > 0)
            await this.ingredientsService.setConversions(
              { ingredientId: prepIngredient.id, ownerId },
              conversions,
              manager,
            );

          if (ingredients?.length > 0)
            await this.recipesService.setIngredients(
              { recipeId: recipe.id, ownerId },
              ingredients,
              manager,
            );

          const ingredient = await manager.findOne(PrepIngredient, {
            where: { id: prepIngredient.id },
            relations: ['recipe', 'recipe.batchUnit'],
          });
          await this.getParRangeAndUsages(ingredient, manager);

          return prepIngredient;
        },
        'SERIALIZABLE',
      );
    } catch (err) {
      if (err.code == PostgresErrorCode.UNIQUE_VIOLATION) {
        return await this.transactionManagerService.ensureTransactional(
          manager,
          async (manager) => {
            const items = await manager.find(PrepIngredient, {
              select: ['name'],
              where: {
                ownerId,
                name: Like(`${name.replace(/[_%]/g, '\\$&')}%`),
              },
            });
            let index: number;
            for (index = 2; ; index++) {
              if (items.every((item) => item.name !== `${name} - ${index}`))
                break;
            }
            return await this.create(
              ownerId,
              { ...values, name: `${name} - ${index}` },
              manager,
            );
          },
          'SERIALIZABLE',
        );
      }

      throw err;
    }
  }

  async find(
    options: {
      ownerId?: PrepIngredient['ownerId'];
      search?: string;
    } & PaginatedRequest,
    manager: EntityManager = this.entityManager,
  ): Promise<
    PaginatedResponse & {
      prepIngredients: PrepIngredient[];
      costs: number[];
      parLevels: number[];
    }
  > {
    const { page, pageSize } = options;

    const paginator = this.paginatorFactoryService.create<PrepIngredient>(
      page,
      pageSize,
    );

    const { ownerId, search } = options;
    const queryOptions = {
      where: (qb) => {
        if (ownerId) qb.andWhere('"ownerId" = :ownerId', { ownerId });
        if (search)
          qb.andWhere(
            '("name" %> :search OR position(LOWER(:search) in LOWER("name")) = 1)',
            { search },
          );
      },
    };

    const [prepIngredientIds, numPages] = await paginator(async (skipTake) => {
      return await manager.getRepository(PrepIngredient).findAndCount({
        ...skipTake,
        ...queryOptions,
        select: ['id'],
        order: { name: 'ASC' },
      });
    });

    const prepIngredients =
      prepIngredientIds.length === 0
        ? []
        : await manager.getRepository(PrepIngredient).find({
            where: { id: In(prepIngredientIds.map(({ id }) => id)) },
            relations: ['recipe', 'recipe.batchUnit'],
            order: { name: 'ASC' },
          });
    const costs = await Promise.all(
      prepIngredients.map((ingredient) => {
        if (!ingredient.recipe.batchUnit) return null;
        return this.ingredientsService.getCost(
          ingredient,
          +ingredient.recipe.batchSize,
          ingredient.recipe.batchUnit,
          100,
          manager,
        );
      }),
    );

    const parLevels = await Promise.all(
      prepIngredients.map(async (ingredient) => {
        if (!ingredient.recipe.batchUnit) return null;
        const [[min, max]] = await this.getParRangeAndUsages(
          ingredient,
          manager,
        );
        return (min + max) / 2;
      }),
    );

    return { prepIngredients, costs, parLevels, numPages };
  }

  async findOne(
    options: {
      id: PrepIngredient['id'];
      ownerId?: PrepIngredient['ownerId'];
    },
    manager: EntityManager = this.entityManager,
  ): Promise<PrepIngredient> {
    const { id, ownerId } = options;

    const prepIngredient = await manager
      .getRepository(PrepIngredient)
      .createQueryBuilder('prep')
      .where(onlyDefined({ scopedId: id, ownerId }))
      .leftJoinAndSelect('prep.recipe', 'recipe')
      .leftJoinAndSelect('recipe.batchUnit', 'batchUnit')
      .leftJoinAndSelect('recipe.ingredients', 'recipeIngredient')
      .leftJoinAndSelect('recipeIngredient.ingredient', 'ingredient')
      .leftJoinAndSelect('recipeIngredient.unit', 'unit')
      .leftJoinAndSelect('prep.unitConversions', 'unitConversion')
      .leftJoinAndSelect('unitConversion.unitA', 'unitA')
      .leftJoinAndSelect('unitConversion.unitB', 'unitB')
      .orderBy('"recipeIngredient"."scopedId"', 'ASC')
      .addOrderBy('"unitConversion"."scopedId"', 'ASC')
      .getOne();
    if (!prepIngredient) throw new NotFoundException();

    return prepIngredient;
  }

  async update(
    options: {
      id: PrepIngredient['scopedId'];
      ownerId?: PrepIngredient['ownerId'];
    },
    values: UpdatePrepIngredientRequest,
    manager: EntityManager = this.entityManager,
  ): Promise<void> {
    const { id, ownerId } = options;
    const {
      name,
      batchSize,
      batchUnit: batchUnitSymbol,
      prepFrequency,
      waste,
      shelfLife,
      conversions,
      ingredients,
      instructions,
    } = values;

    const batchUnit =
      batchUnitSymbol &&
      (await this.unitsService.findByAlias({
        ownerId,
        alias: batchUnitSymbol,
      }));
    if (batchUnitSymbol && !batchUnit)
      throw new BadRequestException(`Unit "${batchUnitSymbol}" not found`);

    const ingredientValues = {
      name,
      yieldPercent: waste != null ? `${100 - waste}` : null,
      prepFrequency,
      shelfLife,
    };
    const recipeValues = { batchSize, batchUnit, instructions };

    try {
      await this.transactionManagerService.ensureTransactional(
        manager,
        async (manager) => {
          const { affected, raw } = await manager
            .createQueryBuilder()
            .update(PrepIngredient)
            .set(onlyDefined(ingredientValues))
            .where({ scopedId: id, ownerId })
            .returning(['id', 'recipeId'])
            .execute();
          if (affected === 0) throw new NotFoundException();

          const [{ id: prepIngredientId, recipeId }] = raw;

          await manager
            .createQueryBuilder()
            .update(PrepRecipe)
            .set(onlyDefined(recipeValues))
            .where({ id: recipeId })
            .execute();

          await this.ingredientsService.setConversions(
            { ingredientId: prepIngredientId, ownerId },
            conversions,
            manager,
          );
          await this.recipesService.setIngredients(
            { recipeId, ownerId },
            ingredients,
            manager,
          );

          const ingredient = await manager.findOne(PrepIngredient, {
            where: { id: prepIngredientId },
            relations: ['recipe', 'recipe.batchUnit'],
          });
          await this.getParRangeAndUsages(ingredient, manager);
        },
      );
    } catch (err) {
      if (err.code == PostgresErrorCode.UNIQUE_VIOLATION)
        throw new BadRequestException(
          'An ingredient already exists with that name',
        );
      throw err;
    }
  }

  async delete(
    options: {
      id: PrepIngredient['scopedId'];
      ownerId?: PrepIngredient['ownerId'];
    },
    manager: EntityManager = this.entityManager,
  ): Promise<void> {
    return await this.ingredientsService.delete(options, manager);
  }

  /*
  async addIngredient (
    options: {
      id: PrepIngredient['id'];
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
    const { id: prepIngredientId, ownerId } = options;
    const { id, amount, unitSymbol, yieldPercent } = values;

    await this.transactionManagerService.ensureTransactional( manager, async manager => {
      const prepIngredient = await this.findOne( { id: prepIngredientId, ownerId } );
      await this.recipesService.addIngredient( { id: prepIngredient.recipeId, ownerId }, { id, amount, unitSymbol, yieldPercent } );
    } );
  }

  async updateIngredient (
    options: {
      prepIngredientId: PrepIngredient['id'];
      recipeIngredientId: RecipeIngredient['id'];
      ownerId?: Account['id'];
    },
    values: {
      amount: number;
      unitId: Unit['id'];
      yieldPercent: number;
    },
    manager: EntityManager = this.entityManager,
  ): Promise<void> {
    const { prepIngredientId, recipeIngredientId, ownerId } = options;
    const { amount, unitId, yieldPercent } = values;

    await this.transactionManagerService.ensureTransactional( manager, async manager => {
      const prepIngredient = await this.findOne( { id: prepIngredientId, ownerId } );
      await this.recipesService.updateIngredient(
        { recipeId: prepIngredient.recipeId, recipeIngredientId, ownerId },
        { amount, unitId, yieldPercent }
      );
    } );
  }

  async removeIngredient (
    options: {
      prepIngredientId: PrepIngredient['id'];
      recipeIngredientId: RecipeIngredient['id'];
      ownerId?: Account['id'];
    },
    manager: EntityManager = this.entityManager,
  ): Promise<void> {
    const { prepIngredientId, recipeIngredientId, ownerId } = options;

    await this.transactionManagerService.ensureTransactional( manager, async manager => {
      const prepIngredient = await this.findOne( { id: prepIngredientId, ownerId } );
      await this.recipesService.removeIngredient( { recipeId: prepIngredient.recipeId, recipeIngredientId, ownerId } );
    } );
  }*/

  async importCsv(
    ownerId: Account['id'],
    csvFile: Buffer | string,
  ): Promise<void> {
    const iterator = this.csvParserService.parse(csvFile);

    for await (const record of iterator) {
      const { scopedId, name, batchSize, batchUnit, shelfLife, waste } = record;
      const yieldPercent = waste !== undefined ? 100 - waste : 100;

      await this.entityManager.transaction(async (manager) => {
        const unit =
          batchUnit &&
          (await this.unitsService.findOrCreateByAlias(
            { ownerId, alias: batchUnit },
            manager,
          ));

        const existing = await manager.findOne(PrepIngredient, {
          where: scopedId ? { scopedId, ownerId } : { name, ownerId },
          relations: ['recipe'],
        });

        if (!existing) {
          await this.create(
            ownerId,
            {
              name,
              yieldPercent: `${yieldPercent}`,
              unit,
              batchSize,
              shelfLife,
            },
            manager,
          );
          return;
        }

        const recipe = existing.recipe;

        Object.assign(
          existing,
          omitEmpty({ name, standardUnit: unit, shelfLife }),
        );
        Object.assign(recipe, omitEmpty({ batchSize, batchUnit: unit }));

        await manager.save(existing);
        await manager.save(recipe);
      });
    }
  }

  async getParRangeAndUsagesM(
    prepIngredient: PrepIngredient,
    ingredients: Ingredient[],
    recipes: Recipe[],
  ): Promise<[[number, number], { type: string; id: number; name: string }[]]> {
    const [
      dailyRequirement,
      usedIn,
    ] = await this.ingredientsService.calculateDailyUsageM(
      {
        ingredient: prepIngredient,
        unit: prepIngredient.recipe.batchUnit,
      },
      ingredients,
      recipes,
    );
    const dailyBatches = dailyRequirement / +prepIngredient.recipe.batchSize;
    const range = [
      (prepIngredient.prepFrequency ?? 1) * dailyBatches,
      (prepIngredient.shelfLife ?? 1) * dailyBatches,
    ].map((x) => +x.toFixed(2));
    return [range as [number, number], usedIn];
  }

  async getParRangeAndUsages(
    prepIngredient: PrepIngredient,
    manager: EntityManager = this.entityManager,
  ): Promise<[[number, number], { type: string; id: number; name: string }[]]> {
    const [
      dailyRequirement,
      usedIn,
    ] = await this.ingredientsService.calculateDailyUsage(
      prepIngredient,
      prepIngredient.recipe.batchUnit,
      manager,
    );
    const dailyBatches = dailyRequirement / +prepIngredient.recipe.batchSize;
    const range = [
      (prepIngredient.prepFrequency ?? 1) * dailyBatches,
      (prepIngredient.shelfLife ?? 1) * dailyBatches,
    ].map((x) => +x.toFixed(2));
    return [range as [number, number], usedIn];
  }
}
