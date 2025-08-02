import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Menu } from '../menus/menu.entity';
import { MenuItem } from '../menu-items/menu-item.entity';
import { PrepIngredient } from '../ingredients/prep-ingredient.entity';
import { Account } from '../accounts/account.entity';

export const DEFAULT_PLAN = 'PREMIUM';
export const FREE_PLAN_MAX_MENUS = 1;
export const FREE_PLAN_MAX_RECIPES = 10;

export const INITIAL_TRIAL_LENGTH = 14;

@Injectable()
export class PlansService {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  public async canConnectPos({ plan }: Account) {
    return plan === 'PREMIUM';
  }

  public async canAddMenu(
    { plan, id: ownerId }: Account,
    manager: EntityManager = this.entityManager,
  ): Promise<boolean> {
    if (plan === 'BASIC' || plan === 'PREMIUM') return true;

    const numMenus = await manager.count(Menu, { ownerId });
    return numMenus < FREE_PLAN_MAX_MENUS;
  }

  public async canAddRecipe(
    { plan, id: ownerId }: Account,
    manager: EntityManager = this.entityManager,
  ): Promise<boolean> {
    if (plan === 'BASIC' || plan === 'PREMIUM') return true;

    const numPrepIngredients = await manager.count(PrepIngredient, { ownerId });
    const numMenuItems = await manager.count(MenuItem, { ownerId });

    return numPrepIngredients + numMenuItems < FREE_PLAN_MAX_RECIPES;
  }

  public async withinPlanConstraints(
    account: Account,
    plan: string = account.plan,
    manager: EntityManager = this.entityManager,
  ): Promise<boolean> {
    if (plan === 'BASIC' || plan === 'PREMIUM') return true;

    const ownerId = account.id;

    const numMenus = await manager.count(Menu, { ownerId });
    if (numMenus > FREE_PLAN_MAX_MENUS) return false;

    const numPrepIngredients = await manager.count(PrepIngredient, { ownerId });
    const numMenuItems = await manager.count(MenuItem, { ownerId });
    if (numPrepIngredients + numMenuItems > FREE_PLAN_MAX_RECIPES) return false;

    return true;
  }
}
