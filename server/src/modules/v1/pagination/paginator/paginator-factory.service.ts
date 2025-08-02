import { Injectable } from '@nestjs/common';

export interface SkipTake {
  skip: number;
  take: number;
}

@Injectable()
export class PaginatorFactoryService {
  create<T>(
    page: number,
    pageSize: number,
  ): (
    runWithPagination: (skipTake: SkipTake) => Promise<[T[], number]>,
  ) => Promise<[T[], number]> {
    return async function (
      runWithPagination: (skipTake: SkipTake) => Promise<[T[], number]>,
    ) {
      const [result, count] = await runWithPagination({
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

      return [result, Math.ceil(count / pageSize)];
    };
  }
}
