import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Like, In } from 'typeorm';
import { MenuItem } from './menu-item.entity';
import {
  PaginatedRequest,
  PaginatedResponse,
} from '../pagination/DTO/pagination.dto';
import { PaginatorFactoryService } from '../pagination/paginator/paginator-factory.service';

import { onlyDefined, toStringOrNull } from '../../../util/Util';
import { TransactionManagerService } from '../transaction-manager/transaction-manager.service';
import { PlatingRecipe } from '../recipes/plating-recipe.entity';
import { RecipesService } from '../recipes/recipes.service';
import _ = require('lodash');
import { UpdateMenuItemRequest } from './DTO/update.menu-item.dto';
import { CreateMenuItemRequest } from './DTO/create.menu-item.dto';
import { ParserService } from '../import/parser.service';
import { Account } from '../accounts/account.entity';
import PostgresErrorCode from '../../../util/PostgresErrors';

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly transactionManagerService: TransactionManagerService,
    private readonly paginatorFactoryService: PaginatorFactoryService,
    private readonly recipesService: RecipesService,
    private readonly csvParserService: ParserService,
  ) {}

  async create(
    ownerId: MenuItem['ownerId'],
    values: {
      scopedId?: MenuItem['scopedId'];
      type?: MenuItem['type'];
      name: MenuItem['name'];
      price?: CreateMenuItemRequest['price'];
      averageWeeklySales?: CreateMenuItemRequest['averageWeeklySales'];
      instructions?: PlatingRecipe['instructions'];
      ingredients?: CreateMenuItemRequest['ingredients'];
    },
    manager: EntityManager = this.entityManager,
  ): Promise<MenuItem> {
    const {
      name,
      price,
      averageWeeklySales,
      instructions,
      scopedId,
      ingredients,
    } = values;

    const recipe = new PlatingRecipe({
      instructions,
    });

    const menuItem = new MenuItem({
      name,
      ownerId,
      recipe,
      price: toStringOrNull(price),
      averageWeeklySales: toStringOrNull(averageWeeklySales),
    });

    try {
      await this.transactionManagerService.ensureTransactional(
        manager,
        async (manager) => {
          if (!scopedId) {
            const { maxId } = await manager
              .getRepository(MenuItem)
              .createQueryBuilder()
              .select('MAX("scopedId") "maxId"')
              .withDeleted()
              .where('"ownerId" = :ownerId', { ownerId })
              .getRawOne();
            menuItem.scopedId = (maxId || 0) + 1;
          }
          await manager.save(recipe);
          await manager.save(menuItem);

          if (ingredients?.length > 0)
            await this.recipesService.setIngredients(
              { ownerId, recipeId: recipe.id },
              ingredients,
              manager,
            );
        },
        'SERIALIZABLE',
      );

      return menuItem;
    } catch (err) {
      if (err.code == PostgresErrorCode.UNIQUE_VIOLATION) {
        return await this.transactionManagerService.ensureTransactional(
          manager,
          async (manager) => {
            const items = await manager.find(MenuItem, {
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
      ownerId?: MenuItem['ownerId'];
      search?: string;
    } & PaginatedRequest,
    manager: EntityManager = this.entityManager,
  ): Promise<PaginatedResponse & { menuItems: MenuItem[] }> {
    const { page, pageSize } = options;

    const paginator = this.paginatorFactoryService.create<MenuItem>(
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

    const [menuItemIds, numPages] = await paginator(async (skipTake) => {
      return await manager.getRepository(MenuItem).findAndCount({
        ...skipTake,
        ...queryOptions,
        select: ['id'],
        order: { scopedId: 'ASC' },
      });
    });

    const menuItems =
      menuItemIds.length === 0
        ? []
        : await manager.getRepository(MenuItem).find({
            where: { id: In(menuItemIds.map(({ id }) => id)) },
            relations: [
              'recipe',
              'recipe.ingredients',
              'recipe.ingredients.ingredient',
              'recipe.ingredients.unit',
              'recipe.ingredients.ingredient.defaultPack',
              'recipe.ingredients.ingredient.defaultPack.itemUnit',
            ],
            order: { scopedId: 'ASC' },
          });
    return { menuItems, numPages };
  }

  async findOne(
    options: {
      id: MenuItem['id'];
      ownerId?: MenuItem['ownerId'];
    },
    manager: EntityManager = this.entityManager,
  ): Promise<MenuItem> {
    const { id, ownerId } = options;

    const menuItem = await manager
      .getRepository(MenuItem)
      .createQueryBuilder('item')
      .where(onlyDefined({ scopedId: id, ownerId }))
      .leftJoinAndSelect('item.recipe', 'recipe')
      .leftJoinAndSelect('recipe.ingredients', 'recipeIngredient')
      .leftJoinAndSelect('recipeIngredient.ingredient', 'ingredient')
      .leftJoinAndSelect('ingredient.defaultPack', 'defaultPack')
      .leftJoinAndSelect('defaultPack.itemUnit', 'itemUnit')
      .leftJoinAndSelect('recipeIngredient.unit', 'unit')
      .orderBy('"recipeIngredient"."scopedId"', 'ASC')
      .getOne();
    if (!menuItem) throw new NotFoundException();

    return menuItem;
  }

  async update(
    options: {
      id: MenuItem['id'];
      ownerId?: MenuItem['ownerId'];
    },
    values: UpdateMenuItemRequest,
    manager: EntityManager = this.entityManager,
  ): Promise<void> {
    const { id, ownerId } = options;
    const {
      name,
      price,
      averageWeeklySales,
      instructions,
      ingredients,
    } = values;

    const itemValues = {
      name,
      price: toStringOrNull(price),
      averageWeeklySales: toStringOrNull(averageWeeklySales),
    };
    const recipeValues = { instructions };

    try {
      return await this.transactionManagerService.ensureTransactional(
        manager,
        async (manager) => {
          const {
            affected,
            raw: [{ recipeId }],
          } = await manager
            .createQueryBuilder()
            .update(MenuItem)
            .set(itemValues)
            .where({ scopedId: id, ownerId })
            .returning(['recipeId'])
            .execute();
          if (affected === 0) throw new NotFoundException();

          await manager
            .createQueryBuilder()
            .update(PlatingRecipe)
            .set(recipeValues)
            .where({ id: recipeId })
            .execute();

          await this.recipesService.setIngredients(
            { recipeId, ownerId },
            ingredients,
            manager,
          );
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
      id: MenuItem['id'];
      ownerId?: MenuItem['ownerId'];
    },
    manager: EntityManager = this.entityManager,
  ): Promise<void> {
    const { id, ownerId } = options;
    const { affected } = await manager.softDelete(
      MenuItem,
      onlyDefined({ scopedId: id, ownerId, deletedAt: null }),
    );

    if (affected === 0) throw new NotFoundException();
  }

  /*
  async addIngredient (
    options: {
      id: MenuItem['id'];
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
    const { id: menuItemId, ownerId } = options;
    const { id, amount, unitSymbol, yieldPercent } = values;

    await this.transactionManagerService.ensureTransactional( manager, async manager => {
      const menuItem = await this.findOne( { id: menuItemId, ownerId } );
      await this.recipesService.addIngredient( { id: menuItem.recipeId, ownerId }, { id, amount, unitSymbol, yieldPercent } );
    } );
  }

  async updateIngredient (
    options: {
      menuItemId: MenuItem['id'];
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
    const { menuItemId, recipeIngredientId, ownerId } = options;
    const { amount, unitId, yieldPercent } = values;

    await this.transactionManagerService.ensureTransactional( manager, async manager => {
      const menuItem = await manager.findOne( MenuItem, { id: menuItemId, ownerId } );
      if ( ! menuItem )
        throw new NotFoundException;
      await this.recipesService.updateIngredient(
        { recipeId: menuItem.recipeId, recipeIngredientId, ownerId },
        { amount, unitId, yieldPercent },
        manager
      );
    } );
  }

  async removeIngredient (
    options: {
      menuItemId: MenuItem['id'];
      recipeIngredientId: RecipeIngredient['id'];
      ownerId?: Account['id'];
    },
    manager: EntityManager = this.entityManager,
  ): Promise<void> {
    const { menuItemId, recipeIngredientId, ownerId } = options;

    await this.transactionManagerService.ensureTransactional( manager, async manager => {
      const menuItem = await this.findOne( { id: menuItemId, ownerId } );
      await this.recipesService.removeIngredient( { recipeId: menuItem.recipeId, recipeIngredientId, ownerId } );
    } );
  }
  */

  async importCsv(
    ownerId: Account['id'],
    csvFile: Buffer | string,
  ): Promise<void> {
    const iterator = this.csvParserService.parse(csvFile);

    for await (const record of iterator) {
      const { scopedId, name, price, averageWeeklySales } = record;

      await this.entityManager.transaction(async (manager) => {
        const existing = await manager.findOne(MenuItem, {
          where: scopedId ? { scopedId, ownerId } : { name, ownerId },
          relations: ['recipe'],
        });

        if (!existing) {
          await this.create(
            ownerId,
            { name, price, averageWeeklySales },
            manager,
          );
          return;
        }

        Object.assign(existing, { name, price, averageWeeklySales });

        await manager.save(existing);
        await manager.save(existing.recipe);
      });
    }
  }

  async calculatePlateCost(
    menuItem: MenuItem,
    manager: EntityManager = this.entityManager,
  ): Promise<number> {
    return await this.recipesService.calculateCost(menuItem.recipe, manager);
  }
}
