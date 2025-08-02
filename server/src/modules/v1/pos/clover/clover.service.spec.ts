import { Test, TestingModule } from '@nestjs/testing';
import { CloverService } from './clover.service';

describe('CloverService', () => {
  let service: CloverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloverService],
    }).compile();

    service = module.get<CloverService>(CloverService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
