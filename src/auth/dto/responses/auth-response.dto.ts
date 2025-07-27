import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsObject,
  ValidateNested,
  IsEmail,
  IsEnum,
  IsBoolean,
  IsDate,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '@prisma/client';

export class UserInfoDto {
  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Username',
    example: 'johndoe',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'User role',
    enum: Role,
    example: Role.EMPLOYEE,
  })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({
    description: 'Whether user is active',
    example: true,
  })
  @IsBoolean()
  is_active: boolean;

  @ApiProperty({
    description: 'User creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDate()
  created_at: Date;

  @ApiProperty({
    description: 'User last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDate()
  updated_at: Date;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  access_token: string;

  @ApiProperty({
    description: 'Token type',
    example: 'Bearer',
  })
  @IsString()
  token_type: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 3600,
    required: false,
  })
  @IsOptional()
  expires_in?: number;

  @ApiProperty({
    description: 'Refresh token expiration date (for frontend reference)',
    example: '2024-01-08T00:00:00.000Z',
  })
  @IsDate()
  refresh_token_expires_at: Date;

  @ApiProperty({
    description: 'User information',
    type: UserInfoDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => UserInfoDto)
  user: UserInfoDto;
}

export class TokenResponseDto {
  @ApiProperty({
    description: 'New JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  access_token: string;

  @ApiProperty({
    description: 'Token type',
    example: 'Bearer',
  })
  @IsString()
  token_type: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 3600,
    required: false,
  })
  @IsOptional()
  expires_in?: number;

  @ApiProperty({
    description: 'Refresh token expiration date (for frontend reference)',
    example: '2024-01-08T00:00:00.000Z',
  })
  @IsDate()
  refresh_token_expires_at: Date;

  @ApiProperty({
    description: 'User information',
    type: UserInfoDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => UserInfoDto)
  user: UserInfoDto;
}

export class UserProfileResponseDto extends UserInfoDto {}
