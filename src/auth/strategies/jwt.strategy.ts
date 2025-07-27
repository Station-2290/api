import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { TokenService } from '../token.service';
import { Request } from 'express';

export interface JwtPayload {
  sub: number;
  email: string;
  username: string;
  role: string;
  jti: string;
  iat?: number;
  exp?: number;
}

// Custom JWT extractor that supports both headers and query parameters
const jwtExtractor = (req: Request): string | null => {
  // First try to get from Authorization header
  const fromHeader = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  if (fromHeader) {
    return fromHeader;
  }

  // If not in header, check query parameter (for SSE)
  const token = req.query?.token as string;
  return token || null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
  ) {
    super({
      jwtFromRequest: jwtExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('auth.jwtSecret'),
    });
  }

  async validate(payload: JwtPayload) {
    const isBlacklisted = await this.tokenService.isTokenBlacklisted(
      payload.jti,
    );
    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been revoked');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.is_active) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      jti: payload.jti,
      customer_id: user.customer_id,
    };
  }
}
