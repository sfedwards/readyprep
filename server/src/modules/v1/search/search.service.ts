import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Account } from '../accounts/account.entity';

const MAX_SEARCH_RESULTS = 10;

@Injectable()
export class SearchService {
  constructor(@InjectEntityManager() private readonly entityManager) {}

  async find<T>(
    ctor: { new (): T },
    ownerId: Account['id'],
    query?: string,
    limit?: number,
    manager: EntityManager = this.entityManager,
  ): Promise<T[]> {
    const qb = manager
      .createQueryBuilder()
      .select('ingredient')
      .from(ctor, 'ingredient')
      .andWhere('"ownerId" = :ownerId', { ownerId });
    const queryScoreExpression =
      'word_similarity(:query, "name")*word_similarity("name", :query)/(( CASE WHEN POSITION(LOWER(:query) in LOWER("name")) = 0 THEN 100 ELSE POSITION(LOWER(:query) in LOWER("name")) END))';
    if (query) {
      qb.addSelect(queryScoreExpression, 'score');
      qb.andWhere(`${queryScoreExpression} > :threshold`, {
        threshold: 0.0007,
      });
      qb.setParameters({ query });
      qb.addOrderBy('"score"', 'DESC');
    }

    qb.addOrderBy('"name"', 'ASC');

    qb.limit(limit ?? MAX_SEARCH_RESULTS);

    return await qb.getMany();
  }
}
