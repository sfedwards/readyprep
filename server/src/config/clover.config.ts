import { registerAs } from '@nestjs/config';

export default registerAs('clover', () => ({
  appId: process.env.CLOVER_APP_ID,
  appSecret: process.env.CLOVER_APP_SECRET,
  webhookVerificationCode: process.env.CLOVER_WEBHOOK_CODE,
}));
