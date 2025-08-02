import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

@Injectable()
export class PasswordHashService {
  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  async verify(hash: string, password: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
