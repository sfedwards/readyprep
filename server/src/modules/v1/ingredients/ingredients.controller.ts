import {
  Controller,
  Get,
  UseGuards,
  Query,
  Session,
  Param,
  Body,
  Post,
} from '@nestjs/common';
import { LoggedInGuard } from '../auth/logged-in.guard';
import {
  FindIngredientsRequest,
  FindIngredientsResponse,
} from './DTO/find.ingredient.dto';
import { V1IngredientsService } from './ingredients.service';
import {
  GetIngredientCostRequest,
  GetIngredientCostResponse,
} from './DTO/get-cost.ingredient';
import { UnitsService } from '../units/units.service';
import { GetUsageRequest, GetUsageResponse } from './DTO/get-usage.dto';

@Controller('ingredients')
export class IngredientsController {
  constructor(
    private readonly ingredientsService: V1IngredientsService,
    private readonly unitsService: UnitsService,
  ) {}

  @Get('search')
  @UseGuards(LoggedInGuard)
  async find(
    @Query() { query }: FindIngredientsRequest,
    @Session() { accountId: ownerId },
  ) {
    return new FindIngredientsResponse(
      await this.ingredientsService.find({ ownerId, query }),
    );
  }

  @Post(':id/cost')
  @UseGuards(LoggedInGuard)
  async getCost(
    @Param('id') id,
    @Body() body: GetIngredientCostRequest,
    @Session() { accountId: ownerId },
  ): Promise<GetIngredientCostResponse> {
    const { amount, unit: unitSymbol, waste } = body;

    const ingredient = await this.ingredientsService.findOneWithComponents(
      ownerId,
      id,
    );
    const unit = await this.unitsService.findOne({
      ownerId,
      symbol: unitSymbol,
    });
    const cost = await this.ingredientsService.getCost(
      ingredient,
      amount,
      unit,
      100 - waste,
    );

    return new GetIngredientCostResponse(cost);
  }

  @Post(':id/getUsage')
  @UseGuards(LoggedInGuard)
  async getUsage(
    @Param('id') id,
    @Body() body: GetUsageRequest,
    @Session() { accountId: ownerId },
  ): Promise<GetUsageResponse> {
    const usage = await this.ingredientsService.getUsage({ id, ownerId });
    return new GetUsageResponse(usage);
  }
}
