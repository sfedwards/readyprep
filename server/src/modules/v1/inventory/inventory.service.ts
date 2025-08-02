import { Injectable } from '@nestjs/common';
import { EntityManager, LessThan, Between, In } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Ingredient } from '../ingredients/ingredient.entity';
import { InventoryLog, LogType } from './log.entity';
import _ = require('lodash');
import { RecipesService } from '../recipes/recipes.service';
import { Recipe } from '../recipes/recipe.entity';
import { PrepIngredient } from '../ingredients/prep-ingredient.entity';
import { PantryIngredient } from '../ingredients/pantry-ingredient.entity';
import { UnitsService } from '../units/units.service';
import { LocationModel } from '../../app/locations/infra/models/location.model';
import { PrepRecipe } from '../recipes/prep-recipe.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectEntityManager() public readonly entityManager: EntityManager,
    private readonly recipesService: RecipesService,
    private readonly unitsService: UnitsService,
  ) {}

  public async produce(
    location: LocationModel | LocationModel['id'],
    recipe: Recipe | Recipe['id'],
    numBatches = 1,
    at: Date = new Date(),
    manager: EntityManager = this.entityManager,
  ) {
    const locationId = location instanceof LocationModel ? location.id : location;
    const recipeId = recipe instanceof Recipe ? recipe.id : recipe;

    const prepRecipe = await manager
      .getRepository(PrepRecipe)
      .findOne(recipeId, { relations: ['prepIngredient'] });

    if (!prepRecipe) throw new Error('No Prep Recipe');

    const productionLog = new InventoryLog({
      locationId,
      ingredientId: prepRecipe.prepIngredient.id,
      time: at,
      type: LogType.RELATIVE,
      value: +(prepRecipe.batchSize ?? 0) * numBatches,
    });

    return await Promise.all([
      ...(await manager.insert(InventoryLog, productionLog)).identifiers,
      ...(await this.consumeRecipe(
        locationId,
        recipeId,
        numBatches,
        at,
        manager,
      )),
    ]);
  }

  public async consumeRecipe(
    locationId: LocationModel['id'],
    recipeId: Recipe['id'],
    quantity = 1,
    at: Date = new Date(),
    manager: EntityManager = this.entityManager,
  ) {
    const recipeIngredients = await this.recipesService.getIngredients(
      recipeId,
      manager,
    );

    const adjustments = await Promise.all(
      recipeIngredients.map(async (recipeIngredient) => {
        const { ingredient, yieldPercent } = recipeIngredient;

        const unit =
          ingredient.type === PrepIngredient.name
            ? (<PrepIngredient>ingredient).recipe.batchUnit
            : (<PantryIngredient>ingredient).standardUOM;
        const amount = await this.unitsService.convert(
          {
            ingredient,
            amount: (+recipeIngredient.amount * 100) / +(yieldPercent ?? 100),
          },
          recipeIngredient.unit,
          unit,
          manager,
        );

        return {
          locationId,
          ingredient,
          time: at,
          type: LogType.RELATIVE,
          value: Number.isFinite(amount) ? -amount * quantity : 0,
        };
      }),
    );

    return (await manager.insert(InventoryLog, adjustments)).identifiers;
  }

  public async getInventory(
    location: LocationModel | LocationModel['id'],
    ingredient: Ingredient | Ingredient['id'],
    at?: Date,
    manager: EntityManager = this.entityManager,
  ) {
    const locationId = location instanceof LocationModel ? location.id : location;
    const ingredientId =
      ingredient instanceof Ingredient ? ingredient.id : ingredient;

    if (!at) at = new Date();

    const mostRecentAbsoluteLog = await manager.findOne(InventoryLog, {
      where: {
        locationId,
        ingredientId,
        time: LessThan(at), // Don't include the current time, since we want to see the theoretical value for current time that has an absolute value
        type: In([LogType.ABSOLUTE, LogType.CACHE]),
      },
      order: { time: 'DESC' },
    });

    const startingValue = mostRecentAbsoluteLog
      ? +mostRecentAbsoluteLog.value
      : 0;
    const startingTime = mostRecentAbsoluteLog
      ? mostRecentAbsoluteLog.time
      : new Date(0);

    const scales = await manager.find(InventoryLog, {
      where: {
        ingredientId,
        type: LogType.SCALE,
        time: Between(startingTime, at),
      },
    });

    scales.push(new InventoryLog({ time: at, value: 1 }));

    const allAdjustments = await Promise.all(
      scales.map(async (scale, i) => {
        const since = i > 0 ? scales[i - 1].time : startingTime;

        const { adjustments } = await manager
          .getRepository(InventoryLog)
          .createQueryBuilder()
          .select('SUM("value") "adjustments"')
          .where('"ingredientId" = :ingredientId', { ingredientId })
          .andWhere('"time" < :scaleTime AND "time" > :since', {
            scaleTime: scale.time,
            since,
          })
          .andWhere('"type" = :type', { type: LogType.RELATIVE })
          .getRawOne();
        return adjustments * scale.value;
      }),
    );

    const result = Math.max(0, startingValue + _.sum(allAdjustments));
    return result;
  }
}
