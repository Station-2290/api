import { ApiProperty } from '@nestjs/swagger';
import { Category as CategoryModel } from '@prisma/client';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class Category implements CategoryModel {
  @ApiProperty({
    description: 'Category ID',
    example: 1,
  })
  @IsInt()
  id: number;

  @ApiProperty({
    description: 'Category name',
    example: 'Hot Beverages',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Category description',
    example: 'Coffee, tea, and other hot drinks',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  description: string | null;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'hot-beverages',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    description: 'Whether the category is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  is_active: boolean;

  @ApiProperty({
    description: 'Display order for sorting',
    example: 1,
    default: 0,
  })
  @IsInt()
  @Min(0)
  display_order: number;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDate()
  created_at: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDate()
  updated_at: Date;
}
