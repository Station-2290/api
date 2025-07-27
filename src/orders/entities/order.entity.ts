import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Order as OrderModel, OrderStatus } from '@prisma/client';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class Order implements OrderModel {
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
  @IsNotEmpty()
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
    nullable: true,
  })
  @IsString()
  @IsOptional()
  notes: string | null;

  @ApiPropertyOptional({
    description: 'Customer ID',
    example: 1,
    nullable: true,
  })
  @IsInt()
  @IsOptional()
  customer_id: number | null;

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
