import { AccountId } from '@domain/account';
import { CountingListQueries } from '@domain/counting-list';
import { CountingListSummaryDto } from '@domain/counting-list/interfaces/dto';
import { IngredientScopedId } from '@domain/ingredients/ingredient-scoped-id';
import { IngredientDto } from '@domain/ingredients/interface/dto/ingredient.dto';
import { LocationId } from '@domain/location';
import { SessionData } from '@modules/v1/auth/interface/session-data.interface';
import { LoggedInGuard } from '@modules/v1/auth/logged-in.guard';
import { V1IngredientsService } from '@modules/v1/ingredients/ingredients.service';
import { PantryIngredient } from '@modules/v1/ingredients/pantry-ingredient.entity';
import { PrepIngredient } from '@modules/v1/ingredients/prep-ingredient.entity';
import { UnitConversion } from '@modules/v1/units/unit-conversion.entity';
import { UnitsService } from '@modules/v1/units/units.service';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Session,
  UseGuards,
} from '@nestjs/common';
import { UnitConversionRequestDto } from './dto';
import { IngredientsService } from './ingredients.service';

@Controller('ingredients')
@UseGuards(LoggedInGuard)
export class IngredientsController {
  public constructor(
    private readonly countingListQueries: CountingListQueries,
    private readonly v1UnitsService: UnitsService,
    private readonly v1IngredientsService: V1IngredientsService,
    private readonly ingredientsService: IngredientsService,
  ) {}

  @Get(':id')
  public async getIngredient(
    @Param('id') id: number,
    @Session() { accountId }: SessionData,
  ): Promise<IngredientDto> {
    return await this.ingredientsService.getIngredient(
      AccountId.from(accountId),
      IngredientScopedId.from(id),
    );
  }

  @Get(':id/counting-list')
  public async getCountingList(
    @Param('id') id: number,
    @Session() { locationId }: SessionData,
  ): Promise<{ list: CountingListSummaryDto; unit: string }> {
    const countingListSummary = await this.countingListQueries.getListSummaryForIngredient(
      LocationId.from(locationId),
      IngredientScopedId.from(id),
    );

    if (!countingListSummary) throw new NotFoundException();

    return countingListSummary;
  }

  @Post(':id/convert')
  public async convert(
    @Session() { accountId }: SessionData,
    @Param('id') id: number,
    @Body()
    { from, to, conversions }: UnitConversionRequestDto,
  ): Promise<number> {
    const ingredient = await this.v1IngredientsService.findOneWithComponents(
      accountId,
      id,
    );

    const fromUnit = await this.v1UnitsService.findByAlias({
      ownerId: accountId,
      alias: from.unit,
    });

    const toUnit = to
      ? await this.v1UnitsService.findByAlias({
          ownerId: accountId,
          alias: to.unit,
        })
      : (ingredient as PantryIngredient).standardUOM ??
        (ingredient as PrepIngredient).recipe.batchUnit;

    const unitConversions = await Promise.all(
      conversions.map(async (conversion) => {
        const unitConversion = new UnitConversion();
        unitConversion.amountA = `${conversion.amountA}`;
        unitConversion.unitA = await this.v1UnitsService.findByAlias({
          ownerId: accountId,
          alias: conversion.unitA,
        });
        unitConversion.amountB = `${conversion.amountB}`;
        unitConversion.unitB = await this.v1UnitsService.findByAlias({
          ownerId: accountId,
          alias: conversion.unitB,
        });
        return unitConversion;
      }),
    );

    return await this.v1UnitsService.convertM(
      {
        ingredient,
        amount: from.amount,
        fromUnit,
        toUnit,
      },
      [...unitConversions, ...ingredient.unitConversions],
    );
  }
}
