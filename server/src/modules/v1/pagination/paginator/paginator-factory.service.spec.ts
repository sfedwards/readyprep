import { Test, TestingModule } from '@nestjs/testing';
import { PaginatorFactoryService } from './paginator-factory.service';

describe('PaginatorFactoryService', () => {
  let service: PaginatorFactoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaginatorFactoryService],
    }).compile();

    service = module.get<PaginatorFactoryService>(PaginatorFactoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
