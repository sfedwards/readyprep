import { LoggedInGuard } from '@modules/v1/auth/logged-in.guard';
import { PantryIngredient } from '@modules/v1/ingredients/pantry-ingredient.entity';
import {
  BadRequestException,
  Controller,
  Header,
  Post,
  Session,
  UseGuards,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Worker, spawn } from 'threads';
import { EntityManager } from 'typeorm';
import { LocationModel } from '../locations/infra/models';
import { CountingSheet } from './interface/counting-sheet.interface';

@Controller('counting-sheets')
export class PdfController {
  constructor(@InjectEntityManager() private readonly manager: EntityManager) {}

  @Post('pantry')
  @UseGuards(LoggedInGuard)
  @Header('Content-Type', 'application/pdf')
  async getCountingSheet(@Session() { locationId, accountId }) {
    const worker = await spawn(
      new Worker('../../../workers/counting-pdf/counting-pdf'),
    );

    const location = await this.manager.findOne(LocationModel, {
      where: {
        id: locationId,
        accountId,
      },
    });

    if (!location) throw new BadRequestException('No location found');

    const ingredients = await this.manager.find(PantryIngredient, {
      where: {
        ownerId: accountId,
      },
      relations: ['standardUOM'],
    });

    const data: CountingSheet = {
      date: new Date(),
      ingredients: ingredients.map(({ name, standardUOM }) => ({
        name,
        unit: standardUOM.symbol,
      })),
    };

    return await worker.generate(data);
  }
}
