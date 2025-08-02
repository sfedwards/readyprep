import {
  Controller,
  Param,
  Get,
  Body,
  Post,
  Delete,
  Session,
  UseGuards,
  Query,
  Put,
} from '@nestjs/common';
import { PantryIngredientsService } from './pantry-ingredients.service';

import {
  FindPantryIngredientsRequest,
  FindPantryIngredientsResponse,
  CreatePantryIngredientRequest,
  CreatePantryIngredientResponse,
  ReadPantryIngredientRequest,
  ReadPantryIngredientResponse,
  UpdatePantryIngredientRequest,
  UpdatePantryIngredientResponse,
  DeletePantryIngredientRequest,
  DeletePantryIngredientResponse,
} from './DTO';
import { LoggedInGuard } from '../auth/logged-in.guard';

import { SearchRequest, SearchResponse } from '../search/DTO/search.dto';
import { PantryIngredient } from './pantry-ingredient.entity';
import { SearchService } from '../search/search.service';
import { V1IngredientsService } from './ingredients.service';
import { Plan } from '../plans/plan.decorator';

@Controller('pantry')
export class PantryIngredientsController {
  constructor(
    private readonly pantryIngredientsService: PantryIngredientsService,
    private readonly ingredientsService: V1IngredientsService,
    private readonly searchService: SearchService,
  ) {}

  @Get()
  @Plan('BASIC')
  @UseGuards(LoggedInGuard)
  async find(
    @Query() args: FindPantryIngredientsRequest,
    @Session() { accountId: ownerId },
  ): Promise<FindPantryIngredientsResponse> {
    const { page, pageSize, search } = args;
    const {
      pantryIngredients,
      parLevels,
      numPages,
    } = await this.pantryIngredientsService.find({
      ownerId,
      page,
      pageSize,
      search,
    });
    return new FindPantryIngredientsResponse(
      pantryIngredients,
      parLevels,
      numPages,
    );
  }

  @Get('search')
  @Plan('BASIC')
  @UseGuards(LoggedInGuard)
  async search(
    @Query() { query }: SearchRequest,
    @Session() { accountId: ownerId },
  ): Promise<SearchResponse> {
    return new SearchResponse(
      await this.searchService.find(PantryIngredient, ownerId, query),
    );
  }

  @Post()
  @Plan('BASIC')
  @UseGuards(LoggedInGuard)
  async create(
    @Body() data: CreatePantryIngredientRequest,
    @Session() { accountId: ownerId },
  ): Promise<CreatePantryIngredientResponse> {
    const { name, waste, orderFrequency, conversions, packs } = data;

    const pantryIngredient = await this.pantryIngredientsService.create(
      ownerId,
      {
        name,
        yieldPercent: waste != null ? `${100 - waste}` : null,
        orderFrequency,
        conversions,
        packs,
      },
    );
    return new CreatePantryIngredientResponse(pantryIngredient);
  }

  @Get(':id')
  @Plan('BASIC')
  @UseGuards(LoggedInGuard)
  async read(
    @Param('id') id,
    @Body() body: ReadPantryIngredientRequest,
    @Session() { accountId: ownerId },
  ): Promise<ReadPantryIngredientResponse> {
    const pantryIngredient = await this.pantryIngredientsService.findOne({
      id,
      ownerId,
    });
    const [
      parLevel,
      usedIn,
    ] = await this.pantryIngredientsService.getParLevelAndUsage(
      pantryIngredient,
    );

    const packParLevels = await this.pantryIngredientsService.getPackParLevels(
      pantryIngredient,
      parLevel,
    );

    return new ReadPantryIngredientResponse(
      pantryIngredient,
      parLevel,
      usedIn,
      packParLevels,
    );
  }

  @Put(':id')
  @Plan('BASIC')
  @UseGuards(LoggedInGuard)
  async update(
    @Param('id') id,
    @Body() body: UpdatePantryIngredientRequest,
    @Session() { accountId: ownerId },
  ): Promise<UpdatePantryIngredientResponse> {
    await this.pantryIngredientsService.update({ id, ownerId }, body);
    return new UpdatePantryIngredientResponse();
  }

  @Delete(':id')
  @Plan('BASIC')
  @UseGuards(LoggedInGuard)
  async delete(
    @Param('id') id,
    @Body() body: DeletePantryIngredientRequest,
    @Session() { accountId: ownerId },
  ): Promise<DeletePantryIngredientResponse> {
    await this.pantryIngredientsService.delete({
      id,
      ownerId,
    });
    return new DeletePantryIngredientResponse();
  }
}
