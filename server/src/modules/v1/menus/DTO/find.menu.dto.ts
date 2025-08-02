import { PaginatedRequest } from '../../pagination/DTO/pagination.dto';

export class FindMenusRequest extends PaginatedRequest {}

export interface FindMenuResponseItem {
  name: string;
  id: number;
  numItems: number;
  updatedAt: Date;
}

export class FindMenusResponse {
  private readonly menus: {
    name: string;
  }[];

  constructor(
    menus: FindMenuResponseItem[],
    private readonly numPages: number,
  ) {
    this.menus = menus.map((menu) => {
      const { name, id, numItems, updatedAt } = menu;

      return {
        id,
        name,
        numItems,
        updatedAt,
      };
    });
  }
}
