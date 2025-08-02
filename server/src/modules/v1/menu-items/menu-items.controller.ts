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
import { MenuItemsService } from './menu-items.service';

import {
  FindMenuItemsRequest,
  FindMenuItemsResponse,
} from './DTO/find.menu-item.dto';
import {
  CreateMenuItemRequest,
  CreateMenuItemResponse,
} from './DTO/create.menu-item.dto';
import {
  ReadMenuItemRequest,
  ReadMenuItemResponse,
} from './DTO/read.menu-item.dto';
import {
  UpdateMenuItemRequest,
  UpdateMenuItemResponse,
} from './DTO/update.menu-item.dto';
import {
  DeleteMenuItemRequest,
  DeleteMenuItemResponse,
} from './DTO/delete.menu-item.dto';
import { LoggedInGuard } from '../auth/logged-in.guard';
import { V1IngredientsService } from '../ingredients/ingredients.service';
import { toNumberOrNull } from '../../../util/Util';
import { SearchRequest, SearchResponse } from '../search/DTO/search.dto';
import { MenuItem } from './menu-item.entity';
import { SearchService } from '../search/search.service';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Account } from '../accounts/account.entity';
import { PlansService } from '../plans/plans.service';
import { Plan } from '../plans/plan.decorator';

@Controller('items')
export class MenuItemsController {
  constructor(
    private readonly menuItemsService: MenuItemsService,
    private readonly ingredientsService: V1IngredientsService,
    private readonly searchService: SearchService,
    private readonly plansService: PlansService,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  @Get()
  @Plan('BASIC')
  @UseGuards(LoggedInGuard)
  async find(
    @Query() body: FindMenuItemsRequest,
    @Session() { accountId: ownerId },
  ): Promise<FindMenuItemsResponse> {
    const { page, pageSize, search } = body;
    const { menuItems, numPages } = await this.menuItemsService.find({
      ownerId,
      page,
      pageSize,
      search,
    });

    const menuItemRows = await Promise.all(
      menuItems.map(async (menuItem) => {
        const {
          scopedId,
          name,
          price,
          averageWeeklySales,
          createdAt,
        } = menuItem;
        return {
          id: scopedId,
          name,
          price: toNumberOrNull(price),
          plateCost: await this.menuItemsService.calculatePlateCost(menuItem),
          averageWeeklySales: toNumberOrNull(averageWeeklySales),
          dateAdded: createdAt,
        };
      }),
    );

    return new FindMenuItemsResponse(menuItemRows, numPages);
  }

  @Get('search')
  @UseGuards(LoggedInGuard)
  async search(
    @Query() { query }: SearchRequest,
    @Session() { accountId: ownerId },
  ): Promise<SearchResponse> {
    return new SearchResponse(
      await this.searchService.find(MenuItem, ownerId, query),
    );
  }

  @Post()
  @UseGuards(LoggedInGuard)
  @Plan('BASIC')
  async create(
    @Body() body: CreateMenuItemRequest,
    @Session() { accountId },
  ): Promise<CreateMenuItemResponse> {
    const account = await this.entityManager.findOne(Account, {
      where: { id: accountId },
    });
    if (!(await this.plansService.canAddRecipe(account)))
      throw new BadRequestException('PLAN_UPGRADE_REQUIRED');
    const { name, price, averageWeeklySales, instructions, ingredients } = body;
    const menuItem = await this.menuItemsService.create(accountId, {
      name,
      price,
      averageWeeklySales,
      instructions,
      ingredients,
    });
    return new CreateMenuItemResponse(menuItem);
  }

  @Get(':id')
  @UseGuards(LoggedInGuard)
  async read(
    @Param('id') id,
    @Body() body: ReadMenuItemRequest,
    @Session() { accountId: ownerId },
  ): Promise<ReadMenuItemResponse> {
    const menuItem = await this.menuItemsService.findOne({ id, ownerId });
    const costs = await Promise.all(
      menuItem.recipe.ingredients.map(
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
    return new ReadMenuItemResponse(menuItem, costs);
  }

  @Put(':id')
  @UseGuards(LoggedInGuard)
  @Plan('BASIC')
  async update(
    @Param('id') id,
    @Body() body: UpdateMenuItemRequest,
    @Session() { accountId: ownerId },
  ): Promise<UpdateMenuItemResponse> {
    const account = await this.entityManager.findOne(Account, ownerId);
    if (!(await this.plansService.withinPlanConstraints(account)))
      throw new BadRequestException('PLAN_UPGRADE_REQUIRED');
    await this.menuItemsService.update({ id, ownerId }, body);
    return new UpdateMenuItemResponse();
  }

  @Delete(':id')
  @UseGuards(LoggedInGuard)
  async delete(
    @Param('id') id,
    @Body() body: DeleteMenuItemRequest,
    @Session() { accountId: ownerId },
  ): Promise<DeleteMenuItemResponse> {
    await this.menuItemsService.delete({ id, ownerId });
    return new DeleteMenuItemResponse();
  }

  /*
  @Post( ':menuItemId/ingredients' )
  @UseGuards( LoggedInGuard )
  async addIngredient (
    @Param( 'menuItemId', new ParseIntPipe ) menuItemId,
    @Body( ) { id, amount, unitSymbol, yieldPercent }: AddRecipeIngredientRequest,
    @Session( ) { accountId: ownerId },
  ): Promise<AddRecipeIngredientResponse> {
    await this.menuItemsService.addIngredient( { id: menuItemId, ownerId }, { id, amount, unitSymbol, yieldPercent } );
    return new AddRecipeIngredientResponse;
  }
  
  @Patch( ':menuItemId/ingredients/:recipeIngredientId' )
  @UseGuards( LoggedInGuard )
  async updateIngredient (
    @Param( 'menuItemId', new ParseIntPipe ) menuItemId,
    @Param( 'recipeIngredientId', new ParseIntPipe ) recipeIngredientId,
    @Body( ) { amount, unitId, yieldPercent }: UpdateRecipeIngredientRequest,
    @Session( ) { accountId: ownerId },
  ): Promise<UpdateRecipeIngredientResponse> {
    await this.menuItemsService.updateIngredient( { menuItemId, recipeIngredientId, ownerId }, { amount, unitId, yieldPercent } );
    return new UpdateRecipeIngredientResponse;
  }
 
  @Delete( ':menuItemId/ingredients/:recipeIngredientId' )
  @UseGuards( LoggedInGuard )
  async removeIngredient (
    @Param( 'menuItemId', new ParseIntPipe ) menuItemId,
    @Param( 'recipeIngredientId', new ParseIntPipe ) recipeIngredientId,
    @Body( ) body: RemoveRecipeIngredientRequest,
    @Session( ) { accountId: ownerId },
  ): Promise<RemoveRecipeIngredientResponse> {
    await this.menuItemsService.removeIngredient( { menuItemId, recipeIngredientId, ownerId } );
    return new RemoveRecipeIngredientResponse;
  }*/
}
