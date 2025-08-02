import {
  Controller,
  Param,
  Get,
  Body,
  Post,
  Delete,
  Patch,
  Session,
  UseGuards,
  ParseIntPipe,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { MenusService } from './menus.service';

import { FindMenusRequest, FindMenusResponse } from './DTO/find.menu.dto';
import { CreateMenuRequest, CreateMenuResponse } from './DTO/create.menu.dto';
import { ReadMenuRequest, ReadMenuResponse } from './DTO/read.menu.dto';
import { UpdateMenuRequest, UpdateMenuResponse } from './DTO/update.menu.dto';
import { DeleteMenuRequest, DeleteMenuResponse } from './DTO/delete.menu.dto';
import { LoggedInGuard } from '../auth/logged-in.guard';
import { CreateMenuSectionRequest } from './DTO/create.menu-section.dto';
import { UpdateMenuSectionRequest } from './DTO/update.menu-section.dto';
import { DeleteMenuSectionRequest } from './DTO/delete.menu-section.dto';
import { MenuSection } from './menu-section.entity';
import { Menu } from './menu.entity';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Account } from '../accounts/account.entity';
import { PlansService } from '../plans/plans.service';
import { Plan } from '../plans/plan.decorator';

@Controller('menus')
export class MenusController {
  constructor(
    private readonly menusService: MenusService,
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly plansService: PlansService,
  ) {}

  @Get()
  @Plan('BASIC')
  @UseGuards(LoggedInGuard)
  async find(
    @Query() body: FindMenusRequest,
    @Session() { accountId: ownerId },
  ): Promise<FindMenusResponse> {
    const { page, pageSize } = body;
    const { menus, numPages } = await this.menusService.find({
      ownerId,
      page,
      pageSize,
    });
    return new FindMenusResponse(menus, numPages);
  }

  @Post()
  @UseGuards(LoggedInGuard)
  @Plan('BASIC')
  async create(
    @Body() data: CreateMenuRequest,
    @Session() { accountId },
  ): Promise<CreateMenuResponse> {
    const account = await this.entityManager.findOne(Account, {
      where: { id: accountId },
    });
    if (!(await this.plansService.canAddMenu(account)))
      throw new BadRequestException('PLAN_UPGRADE_REQUIRED');
    const menu = await this.menusService.create(accountId, data);
    return new CreateMenuResponse(menu);
  }

  @Get(':id')
  @Plan('BASIC')
  @UseGuards(LoggedInGuard)
  async read(
    @Param('id', new ParseIntPipe()) id,
    @Body() body: ReadMenuRequest,
    @Session() { accountId: ownerId },
  ): Promise<ReadMenuResponse> {
    const { menu, costs } = await this.menusService.findOne({ id, ownerId });
    return new ReadMenuResponse(menu, costs);
  }

  @Patch(':id')
  @UseGuards(LoggedInGuard)
  @Plan('BASIC')
  async update(
    @Param('id', new ParseIntPipe()) id,
    @Body() body: UpdateMenuRequest,
    @Session() { accountId: ownerId },
  ): Promise<UpdateMenuResponse> {
    await this.menusService.update({ id, ownerId }, body);
    return new UpdateMenuResponse();
  }

  @Delete(':id')
  @Plan('BASIC')
  @UseGuards(LoggedInGuard)
  async delete(
    @Param('id', new ParseIntPipe()) id,
    @Body() body: DeleteMenuRequest,
    @Session() { accountId: ownerId },
  ): Promise<DeleteMenuResponse> {
    await this.menusService.delete({ id, ownerId });
    return new DeleteMenuResponse();
  }

  @Post(':id/sections')
  @UseGuards(LoggedInGuard)
  async addSection(
    @Param('id', new ParseIntPipe()) id,
    @Body() { name }: CreateMenuSectionRequest,
    @Session() { accountId: ownerId },
  ): Promise<void> {
    await this.menusService.addSection({ id, ownerId }, { name });
  }

  @Patch(':menuId/sections/:sectionId')
  @UseGuards(LoggedInGuard)
  async updateSection(
    @Param('menuId', new ParseIntPipe()) menuId,
    @Param('sectionId', new ParseIntPipe()) sectionId,
    @Body() { name }: UpdateMenuSectionRequest,
    @Session() { accountId: ownerId },
  ): Promise<void> {
    await this.menusService.updateSection(
      { menuId, ownerId, sectionId },
      { name },
    );
  }

  @Delete(':menuId/sections/:sectionId')
  @UseGuards(LoggedInGuard)
  async removeSection(
    @Param('menuId', new ParseIntPipe()) menuId: Menu['id'],
    @Param('sectionId', new ParseIntPipe()) sectionId: MenuSection['id'],
    @Body() body: DeleteMenuSectionRequest,
    @Session() { accountId: ownerId },
  ): Promise<void> {
    await this.menusService.removeSection({ menuId, ownerId, sectionId });
  }
}
