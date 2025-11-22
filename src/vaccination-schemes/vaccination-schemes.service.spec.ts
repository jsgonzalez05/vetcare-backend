import { Test, TestingModule } from '@nestjs/testing';
import { VaccinationSchemesService } from './vaccination-schemes.service';

describe('VaccinationSchemesService', () => {
  let service: VaccinationSchemesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VaccinationSchemesService],
    }).compile();

    service = module.get<VaccinationSchemesService>(VaccinationSchemesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
