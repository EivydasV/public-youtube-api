import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  CONNECTION_URI: process.env.CONNECTION_URI,
  appInfo: {
    APP_NAME: process.env.APP_NAME,
    API_DOMAIN: process.env.API_DOMAIN,
    WEBSITE_DOMAIN: process.env.WEBSITE_DOMAIN,
    API_BASE_PATH: process.env.API_BASE_PATH,
    WEBSITE_BASE_PATH: process.env.WEBSITE_BASE_PATH,
  },
}));
