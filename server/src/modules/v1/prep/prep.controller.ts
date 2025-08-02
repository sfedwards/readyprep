import {
  Controller,
  Get,
  UseGuards,
  Query,
  Session,
  BadRequestException,
  Param,
  Post,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { LoggedInGuard } from '../auth/logged-in.guard';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { LocationModel } from '../../app/locations/infra/models/location.model';
import { PrepService } from './prep.service';
import { InventoryService } from '../inventory/inventory.service';
import { PrepIngredientsService } from '../ingredients/prep-ingredients.service';
import { InventoryLog, LogType } from '../inventory/log.entity';
import { ProductionItem } from './production-item.entity';
import { Production } from './production.entity';
import { RecipesService } from '../recipes/recipes.service';
import { V1IngredientsService } from '../ingredients/ingredients.service';
import { PrepIngredient } from '../ingredients/prep-ingredient.entity';
import { Plan } from '../plans/plan.decorator';

const DAY = 24 * 60 * 60 * 1000;
const PREP_HOUR_UTC = 8;

@Controller('prep-log')
export class PrepController {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly ingredientsService: V1IngredientsService,
    private readonly inventoryService: InventoryService,
    private readonly prepIngredientsService: PrepIngredientsService,
    private readonly prepService: PrepService,
    private readonly recipesService: RecipesService,
  ) {}

  @Get('')
  @Plan('PREMIUM')
  @UseGuards(LoggedInGuard)
  public async log(
    @Query() { pageStr, pageSizeStr },
    @Session() { accountId },
  ) {
    const page = +(pageStr ?? 1);
    const pageSize = Math.min(50, +(pageSizeStr ?? 10));

    const location = await this.entityManager.findOne(LocationModel, { accountId });
    if (!location) throw new NotFoundException();

    const startDate =
      Date.now() -
      DAY * pageSize * (page - 1) -
      (new Date().getUTCHours() < PREP_HOUR_UTC ? DAY : 0);
    const endDate = startDate - DAY * pageSize;

    const days: Partial<{ date: string; value: number }>[] = [];
    for (
      let time = startDate;
      time > endDate && time > +location.createdAt;
      time -= DAY
    ) {
      const date = new Date(time);
      days.push({ date: date.toISOString().slice(0, 10) });
    }

    const ingredients = await this.ingredientsService.getAllIngredients(
      accountId,
    );
    const recipes = await this.recipesService.getAllPrepRecipes(accountId);

    for (const day of days.reverse()) {
      const [, value] = await this.prepService.getPrepForDate(
        location,
        new Date(day.date),
        ingredients,
        recipes,
      );
      day.value = value;
    }
    days.reverse();

    return days;
  }

  @Get(':date')
  @Plan('PREMIUM')
  @UseGuards(LoggedInGuard)
  public async dailyPrep(@Param('date') date, @Session() { accountId }) {
    const location = await this.entityManager.findOne(LocationModel, { accountId });
    if (!location) throw new BadRequestException();

    const [production] = await this.prepService.getPrepForDate(
      location,
      new Date(date),
    );

    const productionDate = new Date(date);
    productionDate.setUTCHours(PREP_HOUR_UTC, 0, 0, 0);

    if (productionDate > new Date()) throw new BadRequestException();

    const prepDate = new Date(productionDate);
    prepDate.setUTCMinutes(15);

    const ingredients = await this.ingredientsService.getAllIngredients(
      accountId,
    );
    const recipes = await this.recipesService.getAllRecipes(accountId);

    //production.items = production.items.filter( ({ prepIngredientId }) => prepIngredientId === 'ebf60727-cc7e-4ede-aae9-127e0cb1cf1c' );

    const dailyPrep = await Promise.all(
      production.items.map(async (item) => {
        const prepIngredient = ingredients.find(
          ({ id }) => id === item.prepIngredientId,
        ) as PrepIngredient;

        // Inventory in batch Unit
        const inventoryBefore = await this.inventoryService.getInventory(
          location,
          prepIngredient,
          productionDate,
        );

        const inventory = await this.inventoryService.getInventory(
          location,
          prepIngredient,
          prepDate,
        );

        const suggested = await this.prepService.getSuggestedBatchesM(
          {
            prepIngredientId: prepIngredient.id,
            inventory,
          },
          ingredients,
          recipes,
        );

        return {
          id: item.id,
          recipeId: prepIngredient.recipeId,
          ingredientId: prepIngredient.scopedId,
          name: prepIngredient.name,
          inventory: inventoryBefore,
          actualInventory: item.actualInventory?.value,
          suggested,
          actualPrep: item.actualPrep?.value,
          batchSize: +(prepIngredient.recipe.batchSize ?? null),
          unit: prepIngredient.recipe.batchUnit?.symbol ?? null,
        };
      }),
    );

    return dailyPrep.sort((a, b) => {
      if (a.suggested && !b.suggested) return -1;
      if (b.suggested && !a.suggested) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  @Post(':date')
  @Plan('PREMIUM')
  @UseGuards(LoggedInGuard)
  public async updateDailyPrep(
    @Param('date') date,
    @Session() { accountId },
    @Body()
    body: { id: ProductionItem['id']; inventory: number; prep: number }[],
  ) {
    const location = await this.entityManager.findOne(LocationModel, { accountId });
    if (!location) throw new BadRequestException();

    const production = await this.entityManager.findOne(Production, {
      where: { location, date },
      relations: ['items', 'items.actualInventory', 'items.actualPrep'],
    });

    const productionDate = new Date(production.date);
    productionDate.setUTCHours(8, 0, 0, 0);

    if (!production) throw new BadRequestException();

    for (const item of body) {
      const productionItem = production.items.find(({ id }) => id === item.id);

      if (!productionItem) continue;

      if (item.prep) {
        await this.entityManager.update(
          InventoryLog,
          productionItem.actualPrepId,
          { value: +item.prep },
        );
      }

      if (item.inventory) {
        if (productionItem.actualInventory) {
          await this.entityManager.update(
            InventoryLog,
            productionItem.actualInventoryId,
            { value: +item.inventory },
          );
        } else {
          productionItem.actualInventory = new InventoryLog({
            locationId: location.id,
            time: productionDate,
            type: LogType.ABSOLUTE,
            value: +item.inventory,
            ingredientId: productionItem.prepIngredientId,
          });
          await this.entityManager.save(productionItem);
        }
      }
    }

    return {};
  }
}
