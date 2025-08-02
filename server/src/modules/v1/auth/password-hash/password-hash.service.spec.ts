import { Test, TestingModule } from '@nestjs/testing';
import { PasswordHashService } from './password-hash.service';
import { performance } from 'perf_hooks';

describe('PasswordHashService', () => {
  let service: PasswordHashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordHashService],
    }).compile();

    service = module.get<PasswordHashService>(PasswordHashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be able to generate and verify a hash', async () => {
    const hash = await service.hash('correct_password');
    expect(typeof hash).toBe('string');
    expect(await service.verify(hash, 'correct_password')).toBe(true);
    expect(await service.verify(hash, 'incorrect_password')).toBe(false);
  });

  it('should generate a new salt and hash each time', async () => {
    const hash1 = await service.hash('secret');
    const hash2 = await service.hash('secret');
    expect(hash1 === hash2).toBe(false);
  });

  it('should take at least 100ms to verify', async () => {
    const hash = await service.hash('password');

    const startTime = performance.now();
    await service.verify(hash, 'password');
    const durationMs = performance.now() - startTime;

    expect(durationMs).toBeGreaterThanOrEqual(100);
  });

  it('should be able to verify a argon2id hash', async () => {
    const result = await service.verify(
      '$argon2id$v=19$m=4096,t=12,p=2$5PUfP6wkRn23ahmS7ioo9A$oQM5kIli5wo',
      'PASSWORD',
    );
    expect(result).toBe(true);
  });
});
