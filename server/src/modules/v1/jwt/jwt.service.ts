import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { JWK, JWT, JWE } from 'jose';

export const enum JWT_TYPES {
  REGISTER = 'REGISTER',
  PASSWORD_RESET = 'PASSWORD_RESET',
  EMAIL_CHANGE = 'EMAIL_CHANGE',
  
}

interface TokenData {
  data: any;
}

@Injectable()
export class JwtService {
  private readonly key: JWK.Key;

  constructor(private readonly configService: ConfigService) {
    this.key = JWK.asKey(
      Buffer.from(configService.get('SECRET').toString(), 'hex'),
    );
  }

  create(data: TokenData['data'], expiresIn = '2 days'): string {
    return JWE.encrypt(
      JWT.sign(
        {
          data,
        },
        this.key,
        {
          expiresIn,
        },
      ),
      this.key,
    );
  }

  verify(token: string, type?: string): TokenData['data'] {
    const data: any = (<TokenData>(
      JWT.verify(JWE.decrypt(token, this.key).toString(), this.key)
    )).data;
    if (type !== undefined && data.type !== type)
      throw new Error('JWT Type Mistmatch');
    return data;
  }
}
