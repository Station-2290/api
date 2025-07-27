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
  IsNumber,
  IsPositive,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationMetaDto } from '../../../shared/dto/pagination.dto';

export class ProductResponseDto {
  @ApiProperty({
    description: 'Product ID',
    example: 1,
  })
  @IsInt()
  id: number;

  @ApiProperty({
    description: 'Product name',
    example: 'Cappuccino',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Classic Italian coffee with steamed milk foam',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Product price',
    example: 4.99,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({
    description: 'Whether the product is active',
    example: true,
  })
  @IsBoolean()
  is_active: boolean;

  @ApiPropertyOptional({
    description: 'Volume in milliliters (for beverages)',
    example: 350,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  volume_ml?: number | null;

  @ApiProperty({
    description: 'Whether the product is promoted',
    example: false,
  })
  @IsBoolean()
  is_promoted: boolean;

  @ApiProperty({
    description: 'Stock Keeping Unit',
    example: 'COF-CAP-001',
  })
  @IsString()
  sku: string;

  @ApiProperty({
    description: 'Available stock quantity',
    example: 100,
  })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({
    description: 'Product image URL',
    example: 'https://example.com/images/cappuccino.jpg',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  image_url?: string | null;

  @ApiProperty({
    description: 'Category ID',
    example: 1,
  })
  @IsNumber()
  category_id: number;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  created_at: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  updated_at: Date;

  @ApiPropertyOptional({
    description: 'Category name',
    example: 'Hot Beverages',
    required: false,
  })
  @IsString()
  @IsOptional()
  category_name?: string;

  @ApiPropertyOptional({
    description: 'Number of times this product has been ordered',
    example: 25,
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  order_count?: number;
}

export class PaginatedProductsResponseDto {
  @ApiProperty({
    description: 'Array of products',
    type: [ProductResponseDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductResponseDto)
  data: ProductResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  @ValidateNested()
  @Type(() => PaginationMetaDto)
  meta: PaginationMetaDto;
}
