import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { TokenService } from './token.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, username, password } = registerDto;

    const existingUser = await this.usersService.findByEmailOrUsername(
      email,
      username,
    );
    if (existingUser) {
      throw new BadRequestException(
        'User with this email or username already exists',
      );
    }

    const user = await this.usersService.create({
      email,
      username,
      password: password,
      role: 'EMPLOYEE',
    });

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      access_token: tokens.access_token,
      token_type: tokens.token_type,
      expires_in: tokens.expires_in,
      refresh_token: tokens.refresh_token,
      refresh_token_expires_at: tokens.refresh_token_expires_at,
    };
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    const user = await this.usersService.findByEmailOrUsername(
      username,
      username,
    );
    if (!user || !user.is_active) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      access_token: tokens.access_token,
      token_type: tokens.token_type,
      expires_in: tokens.expires_in,
      refresh_token: tokens.refresh_token,
      refresh_token_expires_at: tokens.refresh_token_expires_at,
    };
  }

  async refreshToken(refreshToken: string) {
    const storedToken = await this.tokenService.findRefreshToken(refreshToken);
    if (
      !storedToken ||
      storedToken.is_revoked ||
      new Date() > storedToken.expires_at
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findById(storedToken.user_id);
    if (!user || !user.is_active) {
      throw new UnauthorizedException('User not found or inactive');
    }

    await this.tokenService.revokeRefreshToken(storedToken.id);

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      access_token: tokens.access_token,
      token_type: tokens.token_type,
      expires_in: tokens.expires_in,
      refresh_token: tokens.refresh_token,
      refresh_token_expires_at: tokens.refresh_token_expires_at,
    };
  }

  async logout(userId: number, jti: string) {
    await this.tokenService.blacklistToken(userId, jti);
    await this.tokenService.revokeUserRefreshTokens(userId);
  }

  async createApiKey(userId: number, createApiKeyDto: CreateApiKeyDto) {
    const { name, expires_at } = createApiKeyDto;

    const apiKey = await this.usersService.createApiKey(userId, {
      name,
      expires_at: expires_at ? new Date(expires_at) : undefined,
    });

    return apiKey;
  }

  async validateApiKey(key: string) {
    const apiKey = await this.usersService.findApiKey(key);

    if (!apiKey || !apiKey.is_active) {
      return null;
    }

    if (apiKey.expires_at && new Date() > apiKey.expires_at) {
      return null;
    }

    if (!apiKey.user.is_active) {
      return null;
    }

    await this.usersService.updateApiKeyLastUsed(apiKey.id);

    return apiKey.user;
  }

  async validateUser(usernameOrEmail: string, password: string) {
    const user = await this.usersService.findByEmailOrUsername(
      usernameOrEmail,
      usernameOrEmail,
    );

    if (!user || !user.is_active) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  private async generateTokens(user: User) {
    const jti = uuidv4();

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      jti,
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshTokenExpiresInDays = this.configService.getOrThrow<number>(
      'auth.refreshTokenExpiresInDays',
    );
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(
      refreshTokenExpiresAt.getDate() + refreshTokenExpiresInDays,
    );

    const refreshToken = await this.tokenService.createRefreshToken(
      user.id,
      refreshTokenExpiresInDays,
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: this.configService.get<number>('auth.jwtExpiresInSeconds'),
      refresh_token_expires_at: refreshTokenExpiresAt,
    };
  }

  private sanitizeUser(user: User) {
    const { password_hash: _, ...sanitized } = user;
    return sanitized;
  }
}
