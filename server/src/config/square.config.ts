import { registerAs } from '@nestjs/config';

export default registerAs('square', () => ({
  appId: process.env.SQUARE_APP_ID,
  secret: process.env.SQUARE_SECRET,
  webhookKey: process.env.SQUARE_WEBHOOK_KEY,
  v1WebhookKey: process.env.SQUARE_V1_WEBHOOK_KEY,
}));
