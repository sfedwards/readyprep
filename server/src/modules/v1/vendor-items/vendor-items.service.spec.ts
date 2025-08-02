import { Test, TestingModule } from '@nestjs/testing';
import { VendorItemsService } from './vendor-items.service';

describe('VendorItemsService', () => {
  let service: VendorItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VendorItemsService],
    }).compile();

    service = module.get<VendorItemsService>(VendorItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
