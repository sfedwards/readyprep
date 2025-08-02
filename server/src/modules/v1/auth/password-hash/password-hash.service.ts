import { Injectable } from '@nestjs/common';

import argon2 = require('argon2');

const ARGON2_OPTIONS: argon2.Options & { raw: false } = {
  type: argon2.argon2id,
  hashLength: 32,
  parallelism: 4,
  memoryCost: 2 ** 15, // Amount in KiB
  timeCost: 32,
  raw: false,
};

@Injectable()
export class PasswordHashService {
  async hash(password: string): Promise<string> {
    return await argon2.hash(password, ARGON2_OPTIONS);
  }

  async verify(hash: string, password: string): Promise<boolean> {
    return await argon2.verify(hash, password, ARGON2_OPTIONS);
  }
}
