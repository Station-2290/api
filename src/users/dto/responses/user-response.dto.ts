import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  IsEmail,
  IsEnum,
  IsDate,
} from 'class-validator';
import { Type, Exclude } from 'class-transformer';
import { Role } from '@prisma/client';
import { PaginationMetaDto } from '../../../shared/dto/pagination.dto';

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  @IsInt()
  id: number;

  @ApiProperty({
    description: 'User email address',
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

  @Exclude()
  password_hash: string;

  @ApiProperty({
    description: 'User role',
    example: Role.EMPLOYEE,
    enum: Role,
  })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({
    description: 'Whether user is active',
    example: true,
  })
  @IsBoolean()
  is_active: boolean;

  @ApiPropertyOptional({
    description: 'Associated customer ID',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  customer_id?: number | null;

  @ApiProperty({
    description: 'User creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  created_at: Date;

  @ApiProperty({
    description: 'User last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  updated_at: Date;

  @ApiPropertyOptional({
    description: 'Customer full name (if associated)',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  customer_name?: string;

  @ApiPropertyOptional({
    description: 'Customer email (if associated)',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  customer_email?: string;

  @ApiPropertyOptional({
    description: 'Last login timestamp',
    example: '2024-01-15T10:30:00.000Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  last_login_at?: Date;

  @ApiPropertyOptional({
    description: 'Number of API keys created by this user',
    example: 2,
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  api_key_count?: number;
}

export class PaginatedUsersResponseDto {
  @ApiProperty({
    description: 'Array of users',
    type: [UserResponseDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserResponseDto)
  data: UserResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  @ValidateNested()
  @Type(() => PaginationMetaDto)
  meta: PaginationMetaDto;
}
