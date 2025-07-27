import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/modules/prisma';
import { RefreshToken } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TokenService {
  constructor(private readonly prisma: PrismaService) {}

  async createRefreshToken(
    userId: number,
    expiresInDays: number,
  ): Promise<string> {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    await this.prisma.refreshToken.create({
      data: {
        token,
        expires_at: expiresAt,
        user_id: userId,
      },
    });

    return token;
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({
      where: { token },
    });
  }

  async revokeRefreshToken(id: number): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id },
      data: { is_revoked: true },
    });
  }

  async revokeUserRefreshTokens(userId: number): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        user_id: userId,
        is_revoked: false,
      },
      data: { is_revoked: true },
    });
  }

  async blacklistToken(userId: number, jti: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.prisma.blacklistedToken.create({
      data: {
        jti,
        expires_at: expiresAt,
        user_id: userId,
      },
    });
  }

  async isTokenBlacklisted(jti: string): Promise<boolean> {
    const token = await this.prisma.blacklistedToken.findUnique({
      where: { jti },
    });

    if (!token) {
      return false;
    }

    if (new Date() > token.expires_at) {
      await this.prisma.blacklistedToken.delete({
        where: { id: token.id },
      });
      return false;
    }

    return true;
  }

  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();

    await this.prisma.blacklistedToken.deleteMany({
      where: {
        expires_at: {
          lt: now,
        },
      },
    });

    await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [
          {
            expires_at: {
              lt: now,
            },
          },
          {
            is_revoked: true,
            updated_at: {
              lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        ],
      },
    });
  }
}
