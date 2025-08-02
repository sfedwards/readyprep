/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionManagerService } from './transaction-manager.service';
import { mock, instance } from 'ts-mockito';
import { EntityManager } from 'typeorm';
import sinon = require('sinon');

describe('TransactionManagerService', () => {
  let service: TransactionManagerService;
  let manager: EntityManager;
  let spy: sinon.SinonSpy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionManagerService],
    }).compile();

    service = module.get<TransactionManagerService>(TransactionManagerService);

    const managerMock = mock(EntityManager);
    manager = instance(managerMock);
    spy = sinon.spy();

    manager.transaction = spy;
    Object.defineProperty(manager, 'queryRunner', {
      value: { isTransactionActive: false },
      writable: true,
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it("should start a REPEATABLE READ transaction if one isn't already one started", async () => {
    const runInTransaction = jest.fn();
    await service.ensureTransactional(manager, runInTransaction);
    expect(spy.calledOnceWith('REPEATABLE READ', runInTransaction)).toBe(true);
  });

  it('should start a transaction with the correct isolation level', async () => {
    const isolationLevel = 'READ COMMITTED';
    const runInTransaction = jest.fn();
    await service.ensureTransactional(
      manager,
      runInTransaction,
      isolationLevel,
    );
    expect(spy.calledOnceWith(isolationLevel, runInTransaction)).toBe(true);
  });

  it('should not start a new transaction if one is already one started', async () => {
    Object.defineProperty(manager.queryRunner, 'isTransactionActive', {
      value: true,
    });
    await service.ensureTransactional(manager, jest.fn());
    expect(spy.notCalled).toBe(true);
  });
});
