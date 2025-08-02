import { registerAs } from '@nestjs/config';

export interface MailConfig {
  apiKey: string;
}

export default registerAs('mailer', () => ({
  apiKey: process.env.MAIL_SENDGRID_API_KEY,
}));
