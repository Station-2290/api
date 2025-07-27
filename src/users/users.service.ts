import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../shared/modules/prisma';
import { User, ApiKey } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Role } from '@prisma/client';
import { PaginationQueryDto } from '../shared/dto/pagination.dto';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, username, password, role, customer_id } = createUserDto;

    // Check if user already exists
    const existingUser = await this.findByEmailOrUsername(email, username);
    if (existingUser) {
      throw new ConflictException(
        'User with this email or username already exists',
      );
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        email,
        username,
        password_hash,
        role: role || 'EMPLOYEE',
        customer_id,
      },
      include: {
        customer: true,
      },
    });
  }

  async findAll(query: PaginationQueryDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        include: {
          customer: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        has_next_page: page * limit < total,
        has_previous_page: page > 1,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        customer: true,
        api_keys: {
          select: {
            id: true,
            name: true,
            is_active: true,
            expires_at: true,
            last_used_at: true,
            created_at: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        customer: true,
      },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
      include: {
        customer: true,
      },
    });
  }

  async findByEmailOrUsername(
    email: string,
    username: string,
  ): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
      include: {
        customer: true,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // Check if user exists
    const existingUser = await this.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Check for email/username conflicts
    if (updateUserDto.email || updateUserDto.username) {
      const conflictUser = await this.findByEmailOrUsername(
        updateUserDto.email || existingUser.email,
        updateUserDto.username || existingUser.username,
      );

      if (conflictUser && conflictUser.id !== id) {
        throw new ConflictException(
          'User with this email or username already exists',
        );
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        customer: true,
      },
    });
  }

  async changePassword(
    id: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const { current_password, new_password } = changePasswordDto;

    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      current_password,
      user.password_hash,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const new_password_hash = await bcrypt.hash(new_password, 10);

    await this.prisma.user.update({
      where: { id },
      data: {
        password_hash: new_password_hash,
      },
    });
  }

  async changeRole(id: number, role: Role): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: { role },
      include: {
        customer: true,
      },
    });
  }

  async toggleActiveStatus(id: number): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        is_active: !user.is_active,
      },
      include: {
        customer: true,
      },
    });
  }

  async remove(id: number): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }

  // API Key methods
  async createApiKey(
    userId: number,
    data: { name: string; expires_at?: Date },
  ): Promise<ApiKey> {
    const key = `sk_${uuidv4().replace(/-/g, '')}`;

    return this.prisma.apiKey.create({
      data: {
        key,
        name: data.name,
        expires_at: data.expires_at,
        user_id: userId,
      },
    });
  }

  async findApiKey(key: string): Promise<(ApiKey & { user: User }) | null> {
    return this.prisma.apiKey.findUnique({
      where: { key },
      include: {
        user: {
          include: {
            customer: true,
          },
        },
      },
    });
  }

  async updateApiKeyLastUsed(id: number): Promise<void> {
    await this.prisma.apiKey.update({
      where: { id },
      data: {
        last_used_at: new Date(),
      },
    });
  }

  async revokeApiKey(id: number): Promise<ApiKey> {
    return this.prisma.apiKey.update({
      where: { id },
      data: {
        is_active: false,
      },
    });
  }

  async listUserApiKeys(userId: number): Promise<ApiKey[]> {
    return this.prisma.apiKey.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }
}
