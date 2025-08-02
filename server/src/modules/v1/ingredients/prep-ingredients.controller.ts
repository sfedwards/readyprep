import {
  Controller,
  Param,
  Get,
  Body,
  Post,
  Delete,
  Session,
  UseGuards,
  Put,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { PrepIngredientsService } from './prep-ingredients.service';

import {
  FindPrepIngredientsRequest,
  FindPrepIngredientsResponse,
} from './DTO/find.prep-ingredient.dto';
import {
  CreatePrepIngredientRequest,
  CreatePrepIngredientResponse,
} from './DTO/create.prep-ingredient.dto';
import {
  ReadPrepIngredientRequest,
  ReadPrepIngredientResponse,
} from './DTO/read.prep-ingredient.dto';
import {
  UpdatePrepIngredientRequest,
  UpdatePrepIngredientResponse,
} from './DTO/update.prep-ingredient.dto';
import {
  DeletePrepIngredientRequest,
  DeletePrepIngredientResponse,
} from './DTO/delete.prep-ingredient.dto';
import { LoggedInGuard } from '../auth/logged-in.guard';
import { toNumberOrNull } from '../../../util/Util';
import { V1IngredientsService } from './ingredients.service';
import { Account } from '../accounts/account.entity';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { PlansService } from '../plans/plans.service';
import { Plan } from '../plans/plan.decorator';

@Controller('prep')
export class PrepIngredientsController {
  constructor(
    private readonly prepIngredientsService: PrepIngredientsService,
    private readonly ingredientsService: V1IngredientsService,
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly plansService: PlansService,
  ) {}

  @Get()
  @Plan('BASIC')
  @UseGuards(LoggedInGuard)
  async find(
    @Query() body: FindPrepIngredientsRequest,
    @Session() { accountId: ownerId },
  ): Promise<FindPrepIngredientsResponse> {
    const { page, pageSize, search } = body;
    const {
      prepIngredients,
      costs,
      parLevels,
      numPages,
    } = await this.prepIngredientsService.find({
      ownerId,
      page,
      pageSize,
      search,
    });
    return new FindPrepIngredientsResponse(
      prepIngredients,
      costs,
      parLevels,
      numPages,
    );
  }

  @Post()
  @UseGuards(LoggedInGuard)
  @Plan('BASIC')
  async create(
    @Body()
    {
      name,
      batchSize,
      batchUnit,
      shelfLife,
      instructions,
      conversions,
      ingredients,
    }: CreatePrepIngredientRequest,
    @Session() { accountId },
  ): Promise<CreatePrepIngredientResponse> {
    const prepIngredient = await this.prepIngredientsService.create(accountId, {
      name,
      batchSize,
      unitSymbol: batchUnit,
      shelfLife,
      conversions,
      ingredients,
      instructions,
    });
    return new CreatePrepIngredientResponse(prepIngredient);
  }

  @Get(':id')
  @UseGuards(LoggedInGuard)
  async read(
    @Param('id') id,
    @Body() body: ReadPrepIngredientRequest,
    @Session() { accountId: ownerId },
  ): Promise<ReadPrepIngredientResponse> {
    const prepIngredient = await this.prepIngredientsService.findOne({
      id,
      ownerId,
    });
    const [
      parRange,
      usedIn,
    ] = await this.prepIngredientsService.getParRangeAndUsages(prepIngredient);
    const costs = await Promise.all(
      prepIngredient.recipe.ingredients.map(
        async ({ ingredient, amount, unit, yieldPercent }) => {
          ingredient = await this.ingredientsService.findOneWithComponents(
            ownerId,
            ingredient.scopedId,
          );
          return await this.ingredientsService.getCost(
            ingredient,
            toNumberOrNull(amount),
            unit,
            toNumberOrNull(yieldPercent),
          );
        },
      ),
    );
    return new ReadPrepIngredientResponse(
      prepIngredient,
      parRange,
      costs,
      usedIn,
    );
  }

  @Put(':id')
  @UseGuards(LoggedInGuard)
  @Plan('BASIC')
  async update(
    @Param('id') id,
    @Body() body: UpdatePrepIngredientRequest,
    @Session() { accountId: ownerId },
  ): Promise<UpdatePrepIngredientResponse> {
    const account = await this.entityManager.findOne(Account, ownerId);
    if (!(await this.plansService.withinPlanConstraints(account)))
      throw new BadRequestException('PLAN_UPGRADE_REQUIRED');
    await this.prepIngredientsService.update({ id, ownerId }, body);
    return new UpdatePrepIngredientResponse();
  }

  @Delete(':id')
  @UseGuards(LoggedInGuard)
  async delete(
    @Param('id') id,
    @Body() body: DeletePrepIngredientRequest,
    @Session() { accountId: ownerId },
  ): Promise<DeletePrepIngredientResponse> {
    await this.prepIngredientsService.delete({
      id,
      ownerId,
    });
    return new DeletePrepIngredientResponse();
  }
}
