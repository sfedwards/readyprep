import { CountId } from '@domain/count';
import { LocationId } from '@domain/location';
import { SessionData } from '@modules/v1/auth/interface/session-data.interface';
import { LoggedInGuard } from '@modules/v1/auth/logged-in.guard';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Session,
  UseGuards,
} from '@nestjs/common';
import { CountsService } from './counts.service';
import { CreateCountRequestDto } from './dto/create-count.request.dto';
import { CreateCountResponseDto } from './dto/create-count.response';
import { GetCountRequestDto } from './dto/get-count.request.dto';
import { GetCountResponseDto } from './dto/get-count.response.dto';
import { UpdateCountRequestDto } from './dto/update-count.request.dto';
import { UpdateCountResponseDto } from './dto/update-count.response.dto';

@Controller('counts')
@UseGuards(LoggedInGuard)
export class CountsController {
  public constructor(private readonly countsService: CountsService) {}

  @Get()
  public async list(@Session() { locationId }: SessionData) {
    return await this.countsService.getCountsByLocation(
      LocationId.from(locationId),
    );
  }

  @Post()
  public async create(
    @Session() { locationId }: SessionData,
    @Body() { countingListId, date }: CreateCountRequestDto,
  ): Promise<CreateCountResponseDto> {
    const id = await this.countsService.createCount(
      LocationId.from(locationId),
      countingListId,
      date,
    );
    return { id };
  }

  @Get(':id')
  public async get(
    @Param('id') id: string,
    @Body() {}: GetCountRequestDto,
  ): Promise<GetCountResponseDto> {
    return await this.countsService.getCount(CountId.from(id));
  }

  @Patch(':id')
  public async update(
    @Session() { accountId }: SessionData,
    @Param('id') id: string,
    @Body() data: UpdateCountRequestDto,
  ): Promise<UpdateCountResponseDto> {
    await this.countsService.updateCount(accountId, CountId.from(id), data);
    return new UpdateCountResponseDto();
  }
}
