import { PaginatedRequest } from '../../pagination/DTO/pagination.dto';
import { IsOptional } from 'class-validator';

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  plateCost: number;
  averageWeeklySales: number;
  dateAdded: Date;
}

export class FindMenuItemsRequest extends PaginatedRequest {
  @IsOptional()
  search: string;
}

export class FindMenuItemsResponse {
  private readonly items: {
    name: string;
  }[];

  constructor(menuItems: MenuItem[], private readonly numPages: number) {
    Object.assign(this, {
      items: menuItems,
    });
  }
}
