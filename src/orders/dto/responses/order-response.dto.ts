import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsDate,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  IsNumber,
  IsPositive,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '@prisma/client';
import { PaginationMetaDto } from '../../../shared/dto/pagination.dto';

export class OrderItemResponseDto {
  @ApiProperty({
    description: 'Order item ID',
    example: 1,
  })
  @IsInt()
  id: number;

  @ApiProperty({
    description: 'Quantity ordered',
    example: 2,
  })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Unit price at time of order',
    example: 4.99,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  unit_price: number;

  @ApiProperty({
    description: 'Subtotal (quantity * unit_price)',
    example: 9.98,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  subtotal: number;

  @ApiProperty({
    description: 'Product ID',
    example: 1,
  })
  @IsInt()
  product_id: number;

  @ApiPropertyOptional({
    description: 'Product name',
    example: 'Cappuccino',
    required: false,
  })
  @IsString()
  @IsOptional()
  product_name?: string;

  @ApiPropertyOptional({
    description: 'Product SKU',
    example: 'COF-CAP-001',
    required: false,
  })
  @IsString()
  @IsOptional()
  product_sku?: string;

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

export class OrderResponseDto {
  @ApiProperty({
    description: 'Order ID',
    example: 1,
  })
  @IsInt()
  id: number;

  @ApiProperty({
    description: 'Unique order number',
    example: 'ORD-2024-001',
  })
  @IsString()
  order_number: string;

  @ApiProperty({
    description: 'Order status',
    example: OrderStatus.PENDING,
    enum: OrderStatus,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({
    description: 'Total order amount',
    example: 24.99,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  total_amount: number;

  @ApiPropertyOptional({
    description: 'Order notes',
    example: 'No sugar in the cappuccino please',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string | null;

  @ApiPropertyOptional({
    description: 'Customer ID',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  customer_id?: number | null;

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

  @ApiPropertyOptional({
    description: 'Customer full name',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  customer_name?: string;

  @ApiPropertyOptional({
    description: 'Customer email',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  customer_email?: string;

  @ApiPropertyOptional({
    description: 'Order items',
    type: [OrderItemResponseDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemResponseDto)
  @IsOptional()
  items?: OrderItemResponseDto[];

  @ApiPropertyOptional({
    description: 'Number of items in the order',
    example: 3,
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  item_count?: number;
}

export class PaginatedOrdersResponseDto {
  @ApiProperty({
    description: 'Array of orders',
    type: [OrderResponseDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderResponseDto)
  data: OrderResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  @ValidateNested()
  @Type(() => PaginationMetaDto)
  meta: PaginationMetaDto;
}
