import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: process.env.PORT || 3000,
  baseUrl: process.env.BASE_URL || 'https://app.readyprep.io',
}));
