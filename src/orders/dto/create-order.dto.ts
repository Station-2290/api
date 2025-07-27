import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @ApiPropertyOptional({
    description: 'Customer ID (optional for walk-in customers)',
    example: 1,
    nullable: true,
  })
  @IsInt()
  @IsOptional()
  customer_id?: number | null;

  @ApiPropertyOptional({
    description: 'Order notes',
    example: 'Extra hot, no foam',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  notes?: string | null;

  @ApiProperty({
    description: 'Order items',
    type: [CreateOrderItemDto],
    example: [
      { product_id: 1, quantity: 2 },
      { product_id: 3, quantity: 1 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @ArrayMinSize(1)
  items: CreateOrderItemDto[];
}
