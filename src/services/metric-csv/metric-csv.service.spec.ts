import { Test, TestingModule } from '@nestjs/testing';
import { MetricCsvService } from './metric-csv.service';

describe('MetricCsvService', () => {
  let service: MetricCsvService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetricCsvService],
    }).compile();

    service = module.get<MetricCsvService>(MetricCsvService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
