import { ApiProperty } from '@nestjs/swagger';
import { OrderItem as OrderItemModel } from '@prisma/client';
import { IsDate, IsInt, IsNumber, IsPositive, Min } from 'class-validator';

export class OrderItem implements OrderItemModel {
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
    description: 'Order ID',
    example: 1,
  })
  @IsInt()
  order_id: number;

  @ApiProperty({
    description: 'Product ID',
    example: 1,
  })
  @IsInt()
  product_id: number;

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
