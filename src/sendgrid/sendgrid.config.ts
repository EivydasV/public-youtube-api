import { registerAs } from '@nestjs/config';

export default registerAs('sendgrid', () => ({
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  SENDGRID_SENDER_EMAIL: process.env.SENDGRID_SENDER_EMAIL,
}));
