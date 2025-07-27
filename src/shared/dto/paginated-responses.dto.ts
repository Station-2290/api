import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationMetaDto } from './pagination.dto';

// Import all entity types
import { Category } from '../../categories/entities/category.entity';
import { Product } from '../../products/entities/product.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';

export class PaginatedCategoriesResponseDto {
  @ApiProperty({
    description: 'Array of categories',
    type: [Category],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Category)
  data: Category[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  @ValidateNested()
  @Type(() => PaginationMetaDto)
  meta: PaginationMetaDto;
}

export class PaginatedProductsResponseDto {
  @ApiProperty({
    description: 'Array of products',
    type: [Product],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Product)
  data: Product[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  @ValidateNested()
  @Type(() => PaginationMetaDto)
  meta: PaginationMetaDto;
}

export class PaginatedCustomersResponseDto {
  @ApiProperty({
    description: 'Array of customers',
    type: [Customer],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Customer)
  data: Customer[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  @ValidateNested()
  @Type(() => PaginationMetaDto)
  meta: PaginationMetaDto;
}

export class PaginatedOrdersResponseDto {
  @ApiProperty({
    description: 'Array of orders',
    type: [Order],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Order)
  data: Order[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  @ValidateNested()
  @Type(() => PaginationMetaDto)
  meta: PaginationMetaDto;
}

export class PaginatedUsersResponseDto {
  @ApiProperty({
    description: 'Array of users',
    type: [User],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => User)
  data: User[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  @ValidateNested()
  @Type(() => PaginationMetaDto)
  meta: PaginationMetaDto;
}
