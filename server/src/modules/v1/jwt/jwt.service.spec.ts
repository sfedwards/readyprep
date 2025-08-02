import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from './jwt.service';
import { ConfigService } from '@nestjs/config';

describe('JwtService', () => {
  let service: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: ConfigService,
          useValue: {
            get: () => '0000000000',
          },
        },
      ],
    }).compile();

    service = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create and verify JWTs', () => {
    const data = { foo: 'bar' };
    const token = service.create({ foo: 'bar' });
    expect(typeof token).toBe('string');
    expect(
      JSON.parse(Buffer.from(token.split('.')[0], 'base64').toString()),
    ).toBeTruthy();
    expect(service.verify(token)).toEqual(data);
  });
});
