import { Test, TestingModule } from '@nestjs/testing';
import { VendorItemsController } from './vendor-items.controller';

describe('VendorItems Controller', () => {
  let controller: VendorItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendorItemsController],
    }).compile();

    controller = module.get<VendorItemsController>(VendorItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
