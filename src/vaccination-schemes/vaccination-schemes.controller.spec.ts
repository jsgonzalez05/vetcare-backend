import { Test, TestingModule } from '@nestjs/testing';
import { VaccinationSchemesController } from './vaccination-schemes.controller';

describe('VaccinationSchemesController', () => {
  let controller: VaccinationSchemesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VaccinationSchemesController],
    }).compile();

    controller = module.get<VaccinationSchemesController>(VaccinationSchemesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
