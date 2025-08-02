import { registerAs } from '@nestjs/config';

export default registerAs('stripe', () => ({
  apiKey: process.env.STRIPE_API_KEY,
  endpointSecret: process.env.STRIPE_ENDPOINT_SECRET,
}));
