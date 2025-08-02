import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DATABASE_HOST,
  port: +process.env.DATABASE_PORT || 5432,
  name: process.env.DATABASE_NAME || 'readyprep',
  user: process.env.DATABASE_USER || 'readyprep',
  password: process.env.DATABASE_PASSWORD,
}));
