import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationMetaDto } from '../../../shared/dto/pagination.dto';

export class CategoryResponseDto {
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
  name: string;

  @ApiProperty({
    description: 'Category description',
    example: 'Coffee, tea, and other hot drinks',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'hot-beverages',
  })
  @IsString()
  slug: string;

  @ApiProperty({
    description: 'Whether the category is active',
    example: true,
  })
  @IsBoolean()
  is_active: boolean;

  @ApiProperty({
    description: 'Display order for sorting',
    example: 1,
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

  @ApiProperty({
    description: 'Number of products in this category',
    example: 15,
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  product_count?: number;
}

export class PaginatedCategoriesResponseDto {
  @ApiProperty({
    description: 'Array of categories',
    type: [CategoryResponseDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryResponseDto)
  data: CategoryResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  @ValidateNested()
  @Type(() => PaginationMetaDto)
  meta: PaginationMetaDto;
}
