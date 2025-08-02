import { AsyncLocalStorage } from 'async_hooks';
import { EntityManager, getManager } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';
import { sleep } from 'util/sleep';
import { v4 as uuid } from 'uuid';

export const RETRYABLE_POSTGRES_ERROR_CODES = ['40001'];

interface TransactionManagerStore {
  manager: EntityManager;
  isolationLevel: IsolationLevel;
  id: string;
}

interface Options {
  isolationLevel?: IsolationLevel;
  maxRetries?: number;
  readOnly?: boolean;
  deferrable?: boolean;
}

const transactionManagerStore = new AsyncLocalStorage<TransactionManagerStore>();

interface Transactional {
  (options?: Options): (
    target: any,
    method: string,
    descriptor: PropertyDescriptor,
  ) => void;
  getManager: () => EntityManager;
  getTransactionId: () => string | undefined;
}

const isolationLevelRank: Record<IsolationLevel, number> = {
  'READ UNCOMMITTED': 1,
  'READ COMMITTED': 2,
  'REPEATABLE READ': 3,
  SERIALIZABLE: 4,
};

export const Transactional = function ({
  isolationLevel = 'READ COMMITTED',
  maxRetries = 10,
  readOnly = false,
  deferrable = false,
}: Options = {}) {
  return function (
    target: any,
    method: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any) {
      const store = transactionManagerStore.getStore();
      if (store?.manager?.queryRunner?.isTransactionActive) {
        if (
          isolationLevelRank[store.isolationLevel] <
          isolationLevelRank[isolationLevel]
        ) {
          throw new Error(`\
Existing transaction with lower isolation level.
Required ${store.isolationLevel}. Got ${isolationLevel}.`);
        }

        //console.log( store.id, method );
        return originalMethod.apply(this, args);
      }

      if (store?.manager) {
        throw new Error('Transaction has been aborted');
      }

      for (
        let attemptNumber = 1;
        attemptNumber <= maxRetries;
        attemptNumber++
      ) {
        try {
          return await getManager().transaction(
            isolationLevel,
            async (manager) => {
              if (readOnly) await manager.query('SET TRANSACTION READ ONLY');
              if (deferrable) await manager.query('SET TRANSACTION DEFERRABLE');
              const id = uuid();
              return await transactionManagerStore.run(
                {
                  manager,
                  isolationLevel,
                  id,
                },
                () => {
                  //console.log( 'Created transaction with ID: ' + id, method );
                  return originalMethod.apply(this, args);
                },
              );
            },
          );
        } catch (e) {
          if (!RETRYABLE_POSTGRES_ERROR_CODES.includes(`${e.code}`)) throw e;

          if (attemptNumber >= 2) {
            await sleep(50 * 1.6 ** (attemptNumber - 2) + 50 * Math.random());
          }

          // TODO: Switch to better logger
          console.warn('Serialization Failure. Retrying.');
          //console.warn(method, Transactional.getTransactionId());
          //console.error( e );
        }
      }

      // TODO: Switch to better logger
      console.error('MAX RETRIES REACHED. Serialization Failure.');

      throw new Error('Serialization Failure. Max Retries Reached.');
    };
  };
} as Transactional;

Transactional.getManager = () => {
  const store = transactionManagerStore.getStore();
  if (store?.manager) return store.manager;
  throw new Error('No transaction manager');
};

Transactional.getTransactionId = () => {
  const store = transactionManagerStore.getStore();
  return store?.id;
};
