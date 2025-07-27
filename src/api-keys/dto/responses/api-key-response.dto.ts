import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsDate,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ApiKeyResponseDto {
  @ApiProperty({
    description: 'API key ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  id?: number;

  @ApiProperty({
    description: 'API key name/description',
    example: 'My API Key',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'API key (only shown when created)',
    example: 'ak_1234567890abcdef',
    required: false,
  })
  @IsString()
  @IsOptional()
  key?: string;

  @ApiProperty({
    description: 'API key prefix for identification',
    example: 'ak_123...',
    required: false,
  })
  @IsString()
  @IsOptional()
  key_prefix?: string;

  @ApiProperty({
    description: 'Whether the API key is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiProperty({
    description: 'User ID who owns this API key',
    example: 1,
    required: false,
  })
  @IsOptional()
  user_id?: number;

  @ApiProperty({
    description: 'API key creation date',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  created_at?: Date;

  @ApiProperty({
    description: 'API key last update date',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  updated_at?: Date;

  @ApiProperty({
    description: 'Last time the API key was used',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  last_used_at?: Date | null;
}

export class ApiKeyListResponseDto {
  @ApiProperty({
    description: 'List of API keys',
    type: [ApiKeyResponseDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApiKeyResponseDto)
  data: ApiKeyResponseDto[];

  @ApiProperty({
    description: 'Total count of API keys',
    example: 5,
  })
  total: number;
}
