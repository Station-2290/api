import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Product as ProductModel } from '@prisma/client';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class Product implements ProductModel {
  @ApiProperty({
    description: 'Product ID',
    example: 1,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Product name',
    example: 'Cappuccino',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Classic Italian coffee with steamed milk foam',
  })
  @IsString()
  @IsNotEmpty()
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
    default: true,
  })
  @IsBoolean()
  is_active: boolean;

  @ApiPropertyOptional({
    description: 'Volume in milliliters (for beverages)',
    example: 350,
    nullable: true,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  volume_ml: number | null;

  @ApiProperty({
    description: 'Whether the product is promoted',
    example: false,
    default: false,
  })
  @IsBoolean()
  is_promoted: boolean;

  @ApiProperty({
    description: 'Stock Keeping Unit',
    example: 'COF-CAP-001',
  })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({
    description: 'Available stock quantity',
    example: 100,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({
    description: 'Product image URL',
    example: 'https://example.com/images/cappuccino.jpg',
    nullable: true,
  })
  @IsUrl()
  @IsOptional()
  image_url: string | null;

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
  @IsDate()
  created_at: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDate()
  updated_at: Date;
}
