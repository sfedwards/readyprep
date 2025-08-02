import {
  Controller,
  Get,
  UseGuards,
  Body,
  Session,
  Post,
  Delete,
  Param,
  Query,
  Put,
} from '@nestjs/common';
import { LoggedInGuard } from '../auth/logged-in.guard';
import { FindUnitsRequest, FindUnitsResponse } from './DTO/find.unit.dto';
import { UnitsService } from './units.service';
import { CreateUnitRequest, CreateUnitResponse } from './DTO/create.unit.dto';
import { UpdateUnitRequest, UpdateUnitResponse } from './DTO/update.unit.dto';
import { DeleteUnitRequest, DeleteUnitResponse } from './DTO/delete.unit.dto';
import { GetUsageResponse, GetUsageRequest } from './DTO/get-usage.dto';

@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  async find(
    @Query() args: FindUnitsRequest,
    @Session() { accountId: ownerId },
  ): Promise<FindUnitsResponse> {
    const { page, pageSize } = args;
    const { units, numPages } = await this.unitsService.find({
      ownerId,
      page,
      pageSize,
    });
    return new FindUnitsResponse(units, numPages);
  }

  @Post()
  @UseGuards(LoggedInGuard)
  async create(
    @Body() data: CreateUnitRequest,
    @Session() { accountId: ownerId },
  ): Promise<CreateUnitResponse> {
    const { name, symbol, amount: baseAmount, unit: baseUnit } = data;
    const unit = await this.unitsService.create({
      ownerId,
      name,
      symbol,
      baseAmount,
      baseUnit,
    });
    return new CreateUnitResponse(unit);
  }

  @Put(':id')
  @UseGuards(LoggedInGuard)
  async update(
    @Param('id') id,
    @Body() body: UpdateUnitRequest,
    @Session() { accountId: ownerId },
  ): Promise<UpdateUnitResponse> {
    await this.unitsService.update({ id, ownerId }, body);
    return new UpdateUnitResponse();
  }

  @Post(':id/getUsage')
  @UseGuards(LoggedInGuard)
  async getUsage(
    @Param('id') id,
    @Body() body: GetUsageRequest,
    @Session() { accountId: ownerId },
  ): Promise<GetUsageResponse> {
    const usage = await this.unitsService.getUsage({ id, ownerId });
    return new GetUsageResponse(usage);
  }

  @Delete(':id')
  @UseGuards(LoggedInGuard)
  async delete(
    @Param('id') id,
    @Body() body: DeleteUnitRequest,
    @Session() { accountId: ownerId },
  ): Promise<DeleteUnitResponse> {
    await this.unitsService.delete({ id, ownerId });
    return new DeleteUnitResponse();
  }
}
