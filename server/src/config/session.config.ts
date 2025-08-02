import { registerAs } from '@nestjs/config';

export default registerAs('session', () => ({
  cookie: 'session',
}));
