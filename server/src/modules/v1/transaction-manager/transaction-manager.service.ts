import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';

@Injectable()
export class TransactionManagerService {
  async ensureTransactional<T>(
    entityManager: EntityManager,
    runInTransaction: (manager: EntityManager) => Promise<T>,
    isolationLevel?: IsolationLevel,
  ): Promise<T> {
    if (entityManager.queryRunner?.isTransactionActive)
      return await runInTransaction(entityManager);

    if (isolationLevel !== undefined)
      return await entityManager.transaction(isolationLevel, runInTransaction);

    return await entityManager.transaction('REPEATABLE READ', runInTransaction);
  }
}
