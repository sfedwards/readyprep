import { Test, TestingModule } from '@nestjs/testing';
import { CloverController } from './clover.controller';

describe('CloverController', () => {
  let controller: CloverController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CloverController],
    }).compile();

    controller = module.get<CloverController>(CloverController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
