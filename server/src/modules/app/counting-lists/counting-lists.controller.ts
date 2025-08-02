import { CountingListId } from '@domain/counting-list';
import { CountingListSummaryDto } from '@domain/counting-list/interfaces/dto';
import { LocationId } from '@domain/location';
import { SessionData } from '@modules/v1/auth/interface/session-data.interface';
import { LoggedInGuard } from '@modules/v1/auth/logged-in.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Session,
  UseGuards,
} from '@nestjs/common';
import { CountingListsService } from './counting-lists.service';
import {
  MoveToCountingListRequestDto,
  UpdateCountingListRequestDto,
} from './dto';
import { PopulateCountingListsJob } from './jobs/populate-counting-lists/populate-counting-lists.job';

@Controller('counting-lists')
@UseGuards(LoggedInGuard)
export class CountingListsController {
  public constructor(
    private readonly countingListsService: CountingListsService,
    private readonly populateCountingListsJob: PopulateCountingListsJob,
  ) {}

  @Get()
  public async list(
    @Session() { locationId }: SessionData,
  ): Promise<CountingListSummaryDto[]> {
    return await this.countingListsService.getCountingListsByLocation(
      LocationId.from(locationId),
    );
  }

  @Get(':id')
  public async getCountingList(@Param('id') id: string): Promise<any> {
    return await this.countingListsService.getCountingList(
      new CountingListId(id),
    );
  }

  @Post()
  public async createCountingList(
    @Session() { accountId, locationId }: SessionData,
    @Body() data: UpdateCountingListRequestDto,
  ): Promise<{ id: string }> {
    const id = await this.countingListsService.createCountingList(
      accountId,
      LocationId.from(locationId),
      data,
    );

    void this.populateCountingListsJob
      .run(LocationId.from(locationId))
      .catch(console.log);

    return {
      id,
    };
  }

  @Put(':id')
  public async saveCountingList(
    @Session() { accountId, locationId }: SessionData,
    @Param('id') id: string,
    @Body() data: UpdateCountingListRequestDto,
  ): Promise<any> {
    await this.countingListsService.saveCountingList(
      accountId,
      CountingListId.from(id),
      data,
    );
    void this.populateCountingListsJob
      .run(LocationId.from(locationId))
      .catch(console.log);
    return {};
  }

  @Post(':id/add')
  public async moveToCountingList(
    @Session() { accountId, locationId }: SessionData,
    @Param('id') id: string,
    @Body() data: MoveToCountingListRequestDto,
  ): Promise<any> {
    await this.countingListsService.moveToCountingList(
      accountId,
      LocationId.from(locationId),
      CountingListId.from(id),
      data,
    );

    void this.populateCountingListsJob
      .run(LocationId.from(locationId))
      .catch(console.log);

    return {};
  }

  @Delete(':id')
  public async deleteCountingList(
    @Session() { locationId }: SessionData,
    @Param('id') id: string,
  ): Promise<any> {
    await this.countingListsService.deleteCountingList(
      LocationId.from(locationId),
      CountingListId.from(id),
    );
    void this.populateCountingListsJob
      .run(LocationId.from(locationId))
      .catch(console.log);
    return {};
  }
}
