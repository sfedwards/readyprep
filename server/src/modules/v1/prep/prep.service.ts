import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Production } from './production.entity';
import { PrepIngredient } from '../ingredients/prep-ingredient.entity';
import { LocationModel } from '../../app/locations/infra/models/location.model';
import { ProductionItem } from './production-item.entity';
import { InventoryService } from '../inventory/inventory.service';
import { PrepIngredientsService } from '../ingredients/prep-ingredients.service';
import { InventoryLog, LogType } from '../inventory/log.entity';
import { V1IngredientsService } from '../ingredients/ingredients.service';
import { Ingredient } from '../ingredients/ingredient.entity';
import { UnitsService } from '../units/units.service';
import { RecipesService } from '../recipes/recipes.service';
import { Recipe } from '../recipes/recipe.entity';
import { PrepRecipe } from '../recipes/prep-recipe.entity';

@Injectable()
export class PrepService {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly inventoryService: InventoryService,
    private readonly unitsService: UnitsService,
    private readonly recipesService: RecipesService,
    private readonly ingredientsService: V1IngredientsService,
    private readonly prepIngredientsService: PrepIngredientsService,
  ) {}

  public async getPrepForDate(
    location: LocationModel | LocationModel['id'],
    date: Date,
    ingredients?: Ingredient[],
    recipes?: PrepRecipe[],
  ): Promise<[Production, number]> {
    const locationId = location instanceof LocationModel ? location.id : location;

    const existing = await this.entityManager.findOne(Production, {
      where: { locationId, date },
      relations: [
        'location',
        'items',
        'items.actualInventory',
        'items.actualPrep',
        'items.prepIngredient',
      ],
    });

    const prep = existing ?? (await this.createPrepForDate(location, date));

    ingredients =
      ingredients ??
      (await this.ingredientsService.getAllIngredients(
        prep.location.accountId,
      ));
    recipes =
      recipes ??
      (await this.recipesService.getAllPrepRecipes(prep.location.accountId));
    const value = await this.getPrepValueM({ prep }, ingredients, recipes);
    return [prep, value];
  }

  // ingredients should include recipes, conversions.units, packs,
  public async getPrepValueM(
    { prep }: { prep: Production },
    ingredients: Ingredient[],
    recipes: PrepRecipe[],
  ) {
    const costs = await Promise.all(
      prep.items.map(async (item) => {
        const ingredient = ingredients.find(
          ({ id }) => id === item.prepIngredientId,
        ) as PrepIngredient;
        const recipe = recipes.find(({ id }) => id === ingredient.recipeId);

        const cost = await this.ingredientsService.getCostM(
          {
            ingredientId: ingredient.id,
            amount: item.actualPrep.value,
            unit: recipe.batchUnit,
          },
          ingredients,
          recipes,
        );

        return Number.isNaN(cost) ? 0 : cost;
      }),
    );

    return costs.reduce((sum, x) => sum + x, 0);
  }

  public async getPrepValue(prep: Production) {
    const costs = await Promise.all(
      prep.items.map(async (item) => {
        const ingredient = item.prepIngredient;
        const cost = await this.ingredientsService.getCost(
          ingredient,
          item.actualPrep.value,
          ingredient.recipe.batchUnit,
        );
        return Number.isNaN(cost) ? 0 : cost;
      }),
    );

    return costs.reduce((sum, x) => sum + x, 0);
  }

  public async createPrepForDate(
    location: LocationModel | LocationModel['id'],
    date: Date,
  ) {
    if (!(location instanceof LocationModel))
      location = await this.entityManager.findOne(LocationModel, { id: location });

    // The date of the inventory snapshot
    const productionDate = new Date(date);
    productionDate.setUTCHours(8, 0, 0, 0);

    // The date of the inventory update
    const prepDate = new Date(productionDate);
    prepDate.setUTCMinutes(15);

    const production = new Production({
      location,
      date: date,
    });

    const prepIngredients = await this.entityManager.find(PrepIngredient, {
      where: { ownerId: location.accountId },
      relations: ['recipe', 'recipe.batchUnit'],
    });

    production.items = await Promise.all(
      prepIngredients
        .filter(({ recipe }) => recipe.batchUnit)
        .map(async (prepIngredient) => {
          const suggested = await this.getSuggestedBatches(
            location,
            new Date(productionDate),
            prepIngredient,
          );
          const batchSize = +(prepIngredient.recipe.batchSize ?? 0);

          const log = new InventoryLog({
            locationId: (<LocationModel>location).id,
            time: prepDate,
            type: LogType.RELATIVE,
            value: suggested * batchSize,
            ingredient: prepIngredient,
          });

          const productionItem = new ProductionItem({
            production: production,
            prepIngredient,
            actualPrep: log,
          });

          return productionItem;
        }),
    );

    await this.entityManager.save(production);

    return production;
  }

  async getSuggestedBatchesM(
    {
      prepIngredientId,
      inventory,
    }: {
      prepIngredientId: PrepIngredient['id'];
      inventory: number;
    },
    allIngredients: Ingredient[],
    allRecipes: Recipe[],
  ) {
    const prepIngredient = allIngredients.find(
      ({ id }) => id === prepIngredientId,
    ) as PrepIngredient;
    const remainingBatches =
      inventory / +(prepIngredient.recipe.batchSize ?? 1);

    const [
      [minPar, maxPar],
    ] = await this.prepIngredientsService.getParRangeAndUsagesM(
      prepIngredient,
      allIngredients,
      allRecipes,
    );
    const target = minPar + 0.8 * (maxPar - minPar);
    const suggested = Math.max(
      0,
      remainingBatches > 2 * minPar
        ? 0
        : Math.ceil((target - remainingBatches) * 2) / 2,
    );

    return suggested;
  }

  async getSuggestedBatches(
    location: LocationModel['id'] | LocationModel,
    date: Date,
    prepIngredient: PrepIngredient,
  ) {
    // Inventory in batch Unit
    const inventory = await this.inventoryService.getInventory(
      location,
      prepIngredient,
      date,
    );
    const remainingBatches =
      inventory / +(prepIngredient.recipe.batchSize ?? 1);

    const [
      [minPar, maxPar],
    ] = await this.prepIngredientsService.getParRangeAndUsages(prepIngredient);
    const target = minPar + 0.8 * (maxPar - minPar);
    const suggested = Math.max(
      0,
      remainingBatches > 2 * minPar
        ? 0
        : Math.ceil((target - remainingBatches) * 2) / 2,
    );

    return suggested;
  }
}
