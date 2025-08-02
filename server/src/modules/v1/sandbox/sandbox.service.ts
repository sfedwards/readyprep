import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Account } from '../accounts/account.entity';
import { PantryIngredientsService } from '../ingredients/pantry-ingredients.service';
import { PrepIngredientsService } from '../ingredients/prep-ingredients.service';
import { MenuItem, MenuItemType } from '../menu-items/menu-item.entity';
import { MenuItemsService } from '../menu-items/menu-items.service';

import * as pantryIngredients from './data/pantry-ingredients.json';
import * as prepIngredients from './data/prep-ingredients.json';
import * as menuItems from './data/menu-items.json';
import { Menu } from '../menus/menu.entity';
import { Ingredient } from '../ingredients/ingredient.entity';
import { TransactionManagerService } from '../transaction-manager/transaction-manager.service';
import { PrepIngredient } from '../ingredients/prep-ingredient.entity';
import { RecipeIngredient } from '../recipes/recipe-ingredient.entity';
import { UnitsService } from '../units/units.service';
import { Unit } from '../units/unit.entity';
import { LocationId } from '@domain/location';

@Injectable()
export class SandboxService {
  constructor(
    private readonly pantryIngredientsService: PantryIngredientsService,
    private readonly prepIngredientsService: PrepIngredientsService,
    private readonly menuItemsService: MenuItemsService,
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly transactionManager: TransactionManagerService,
    private readonly unitsService: UnitsService,
  ) {}

  async createSandboxData(
    accountId: Account['id'],
    manager: EntityManager = this.entityManager,
  ) {
    const savedIngredients: Record<string, Ingredient> = {};
    for (const ingredient of pantryIngredients) {
      savedIngredients[
        ingredient.name
      ] = await this.pantryIngredientsService.create(
        accountId,
        {
          name: ingredient.name,
          packs: [
            {
              price: +(ingredient.packPrice || 0),
              amountPerItem: +(ingredient.packAmountPerItem || '1'),
              numItems: +(ingredient.packSize || '1'),
              unit: ingredient.packItemUnitSymbol,
              vendorId: null,
              catalogNumber: null,
              id: null,
              isDefault: true,
            },
          ],
          yieldPercent: '' + (ingredient.waste ? 100 - +ingredient.waste : 100),
          conversions: ingredient.conversions,
          unit: ingredient.packItemUnitSymbol,
        },
        manager,
      );
    }

    for (const ingredient of prepIngredients) {
      savedIngredients[
        ingredient.name
      ] = await this.prepIngredientsService.create(
        accountId,
        {
          name: ingredient.name,
          batchSize: '' + ingredient.batchSize,
          unitSymbol: ingredient.unit,
          shelfLife: ingredient.shelfLife || undefined,
          instructions: ingredient.instructions,
          yieldPercent: '' + (ingredient.waste ? 100 - +ingredient.waste : 100),
          conversions: ingredient.conversions,
        },
        manager,
      );
    }

    // After adding all ingredients we can add recipes
    for (const ingredient of prepIngredients) {
      const prepIngredient = savedIngredients[
        ingredient.name
      ] as PrepIngredient;
      const ingredients = ingredient.ingredients;

      await manager.insert(
        RecipeIngredient,
        await Promise.all(
          ingredients.map(async (ingredient, index) => {
            const savedIngredient = savedIngredients[ingredient.name];
            return {
              scopedId: index + 1,
              recipeId: prepIngredient.recipeId,
              ingredientId: savedIngredient.id,
              amount: ingredient.amount + '',
              yieldPercent: `${
                ingredient.waste ? 100 - +ingredient.waste : 100
              }`,
              unitId: (
                await this.unitsService.findOrCreateByAlias({
                  ownerId: accountId,
                  alias: ingredient.unit,
                })
              ).id,
            };
          }),
        ),
      );
    }

    const savedMenuItems: Record<string, MenuItem> = {};
    for (const item of menuItems) {
      savedMenuItems[item.name] = await this.menuItemsService.create(
        accountId,
        {
          name: item.name,
          type: MenuItemType.Regular,
          price: item.price,
          averageWeeklySales: item.averageWeeklySales,
          instructions: item.instructions,
        },
        manager,
      );
    }

    for (const item of menuItems) {
      const menuItem = savedMenuItems[item.name] as MenuItem;
      const ingredients = item.ingredients;

      await manager.insert(
        RecipeIngredient,
        await Promise.all(
          ingredients.map(async (ingredient, index) => {
            const savedIngredient = savedIngredients[ingredient.name];
            return {
              scopedId: index + 1,
              recipeId: menuItem.recipeId,
              ingredientId: savedIngredient.id,
              amount: ingredient.amount + '',
              yieldPercent: `${
                ingredient.waste ? 100 - +ingredient.waste : 100
              }`,
              unitId: (
                await this.unitsService.findOrCreateByAlias({
                  ownerId: accountId,
                  alias: ingredient.unit,
                })
              ).id,
            };
          }),
        ),
      );
    }
  }

  async leave(
    accountId: Account['id'],
    reset: boolean,
    manager: EntityManager = this.entityManager,
  ) {
    await this.transactionManager.ensureTransactional(
      manager,
      async (manager) => {
        await manager.update(Account, accountId, { isInSandboxMode: false });
        if (reset) await this.reset(accountId, manager);
      },
    );
  }

  async reset(
    ownerId: Account['id'],
    manager: EntityManager = this.entityManager,
  ) {
    await this.transactionManager.ensureTransactional(
      manager,
      async (manager) => {
        await manager
          .createQueryBuilder()
          .delete()
          .from(Menu)
          .where({ ownerId })
          .execute();
        await manager.delete(MenuItem, { ownerId });
        await manager.delete(Ingredient, { ownerId });
        await manager.delete(Unit, { ownerId });
      },
    );
  }
}
