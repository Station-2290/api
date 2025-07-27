import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../shared/modules/prisma';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { ApiKey } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ApiKeysService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: number,
    createApiKeyDto: CreateApiKeyDto,
  ): Promise<ApiKey & { key: string; key_prefix: string }> {
    const key = `sk_${uuidv4().replace(/-/g, '')}`;
    const key_prefix = `${key.slice(0, 8)}...`;

    const apiKey = await this.prisma.apiKey.create({
      data: {
        key,
        name: createApiKeyDto.name,
        expires_at: createApiKeyDto.expires_at
          ? new Date(createApiKeyDto.expires_at)
          : undefined,
        user_id: userId,
      },
    });

    return { ...apiKey, key, key_prefix };
  }

  async findAll(userId: number): Promise<{
    data: (Partial<ApiKey> & { key_prefix: string; user_id: number })[];
    total: number;
  }> {
    const [apiKeys, total] = await this.prisma.$transaction([
      this.prisma.apiKey.findMany({
        where: {
          user_id: userId,
        },
        select: {
          id: true,
          name: true,
          key: true,
          is_active: true,
          expires_at: true,
          last_used_at: true,
          created_at: true,
          updated_at: true,
          user_id: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.apiKey.count({
        where: {
          user_id: userId,
        },
      }),
    ]);

    const transformedKeys = apiKeys.map((key) => ({
      ...key,
      key_prefix: `${key.key.slice(0, 8)}...`,
      key: undefined, // Don't expose the full key in list
    }));

    return { data: transformedKeys, total };
  }

  async findOne(
    userId: number,
    id: number,
  ): Promise<Partial<ApiKey> & { key_prefix: string; user_id: number }> {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: {
        id,
        user_id: userId,
      },
      select: {
        id: true,
        name: true,
        key: true,
        is_active: true,
        expires_at: true,
        last_used_at: true,
        created_at: true,
        updated_at: true,
        user_id: true,
      },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    return {
      ...apiKey,
      key_prefix: `${apiKey.key.slice(0, 8)}...`,
      key: undefined, // Don't expose the full key
    };
  }

  async update(
    userId: number,
    id: number,
    updateApiKeyDto: UpdateApiKeyDto,
  ): Promise<Partial<ApiKey> & { key_prefix: string; user_id: number }> {
    const existingKey = await this.prisma.apiKey.findFirst({
      where: { id, user_id: userId },
    });

    if (!existingKey) {
      throw new NotFoundException('API key not found');
    }

    const updated = await this.prisma.apiKey.update({
      where: { id },
      data: {
        name: updateApiKeyDto.name,
        expires_at: updateApiKeyDto.expires_at
          ? new Date(updateApiKeyDto.expires_at)
          : undefined,
      },
      select: {
        id: true,
        name: true,
        key: true,
        is_active: true,
        expires_at: true,
        last_used_at: true,
        created_at: true,
        updated_at: true,
        user_id: true,
      },
    });

    return {
      ...updated,
      key_prefix: `${updated.key.slice(0, 8)}...`,
      key: undefined, // Don't expose the full key
    };
  }

  async revoke(userId: number, id: number): Promise<void> {
    const existingKey = await this.prisma.apiKey.findFirst({
      where: { id, user_id: userId },
    });

    if (!existingKey) {
      throw new NotFoundException('API key not found');
    }

    await this.prisma.apiKey.update({
      where: { id },
      data: { is_active: false },
    });
  }

  async remove(userId: number, id: number): Promise<void> {
    const existingKey = await this.prisma.apiKey.findFirst({
      where: { id, user_id: userId },
    });

    if (!existingKey) {
      throw new NotFoundException('API key not found');
    }

    await this.prisma.apiKey.delete({
      where: { id },
    });
  }
}
