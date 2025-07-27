import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtExpiresInSeconds: parseInt(
    process.env.JWT_EXPIRES_IN_SECONDS || '900',
    10,
  ),
  refreshTokenExpiresInDays: parseInt(
    process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || '7',
    10,
  ),
}));
