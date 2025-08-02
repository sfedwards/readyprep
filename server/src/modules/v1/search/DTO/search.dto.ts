import { IsString, IsOptional } from 'class-validator';
import {
  PaginatedRequest,
  PaginatedResponse,
} from '@modules/v1/pagination/DTO/pagination.dto';

export class SearchRequest {
  @IsString()
  @IsOptional()
  query?: string;
}

export class SearchResponse extends Array<SearchResponseRow> {
  constructor(items: { scopedId: string | number; name: string }[]) {
    super();

    Object.assign(
      this,
      items.map(({ scopedId, name }) => ({ id: scopedId, name })),
    );
  }
}

interface SearchResponseRow {
  id: string | number;
  name: string;
}

export class PaginatedSearchRequest extends PaginatedRequest {
  @IsString()
  @IsOptional()
  query?: string;
}

export class PaginatedSearchResponse extends PaginatedResponse {
  constructor(readonly items: SearchResponse, readonly numPages: number) {
    super();
  }
}
