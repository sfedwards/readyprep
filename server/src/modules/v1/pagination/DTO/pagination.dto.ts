import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginatedRequest {
  @Type(() => Number)
  @IsNumber()
  page = 1;

  @Type(() => Number)
  @IsNumber()
  pageSize = 10;
}

export class PaginatedResponse {
  numPages: number;
}
