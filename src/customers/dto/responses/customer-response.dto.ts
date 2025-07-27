import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsDate,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationMetaDto } from '../../../shared/dto/pagination.dto';

export class CustomerResponseDto {
  @ApiProperty({
    description: 'Customer ID',
    example: 1,
  })
  @IsInt()
  id: number;

  @ApiProperty({
    description: 'Customer email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Customer first name',
    example: 'John',
  })
  @IsString()
  first_name: string;

  @ApiProperty({
    description: 'Customer last name',
    example: 'Doe',
  })
  @IsString()
  last_name: string;

  @ApiPropertyOptional({
    description: 'Customer phone number',
    example: '+1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string | null;

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
  full_name?: string;

  @ApiPropertyOptional({
    description: 'Number of orders placed by this customer',
    example: 5,
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  order_count?: number;

  @ApiPropertyOptional({
    description: 'Total amount spent by this customer',
    example: 149.95,
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  total_spent?: number;

  @ApiPropertyOptional({
    description: 'Date of last order',
    example: '2024-01-15T10:30:00.000Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  last_order_date?: Date;
}

export class PaginatedCustomersResponseDto {
  @ApiProperty({
    description: 'Array of customers',
    type: [CustomerResponseDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomerResponseDto)
  data: CustomerResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  @ValidateNested()
  @Type(() => PaginationMetaDto)
  meta: PaginationMetaDto;
}
