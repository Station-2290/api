import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class User {
  @ApiProperty({
    example: 1,
    description: 'User ID',
  })
  id: number;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  email: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'Username',
  })
  username: string;

  @Exclude()
  password_hash: string;

  @ApiProperty({
    enum: Role,
    example: Role.EMPLOYEE,
    description: 'User role',
  })
  role: Role;

  @ApiProperty({
    example: true,
    description: 'Whether user is active',
  })
  is_active: boolean;

  @ApiProperty({
    example: 1,
    description: 'Associated customer ID',
    nullable: true,
  })
  customer_id: number | null;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'User creation timestamp',
  })
  created_at: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'User last update timestamp',
  })
  updated_at: Date;
}
