import {
  Body,
  Controller,
  Header,
  Post,
  Session,
  UseGuards,
} from '@nestjs/common';
import { LoggedInGuard } from '../auth/logged-in.guard';
import { GetScaledRecipesRequestDTO } from './DTO/get-scaled-recipe.dto';

import { RecipesService } from './recipes.service';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  @UseGuards(LoggedInGuard)
  @Header('Content-Type', 'application/pdf')
  async getScaledRecipes(
    @Session() { accountId },
    @Body() { date, recipes }: GetScaledRecipesRequestDTO,
  ) {
    return await this.recipesService.generateScaledRecipesPDF(
      accountId,
      date,
      recipes,
    );
  }
}
