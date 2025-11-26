import { Test, TestingModule } from '@nestjs/testing';
import { VeterinariesController } from './veterinaries.controller';

describe('VeterinariesController', () => {
  let controller: VeterinariesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VeterinariesController],
    }).compile();

    controller = module.get<VeterinariesController>(VeterinariesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
