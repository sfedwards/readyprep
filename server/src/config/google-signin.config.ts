import { registerAs } from '@nestjs/config';

export default registerAs('googleSignin', () => ({
  clientId: process.env.GOOGLE_SIGNIN_CLIENT_ID,
  clientSecret: process.env.GOOGLE_SIGNIN_CLIENT_SECRET,
}));
