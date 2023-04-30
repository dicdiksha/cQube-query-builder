import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

describe('DatabaseService', () => {
  let service: DatabaseService;
  const databasePoolFactory = async (configService: ConfigService) => {
    return new Pool({
      user: configService.get('DB_USERNAME'),
      host: configService.get('DB_HOST'),
      database: configService.get('DB_NAME'),
      password: configService.get('DB_PASSWORD'),
      port: configService.get<number>('DB_PORT'),
    });
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        DatabaseService,
        {
          provide: 'DATABASE_POOL',
          inject: [ConfigService],
          useFactory: databasePoolFactory,
        },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should change he query text', async () => {
    const queryText = 'SELECT * FROM nishtha_courseenrolment_state0programnishtha0coursenishtha';
    const preprocessedQuery = service.preprocessQuery(queryText);
    expect(preprocessedQuery).toBe('SELECT * FROM nishtha_courseenrolment_EwYGERgJDCwmBx0PDmFl')
  })

});
