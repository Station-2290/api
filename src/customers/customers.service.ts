import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from 'src/shared/modules/prisma';
import {
  PaginationQueryDto,
  PaginatedResponseDto,
} from 'src/shared/dto/pagination.dto';
import { PaginationHelper } from 'src/shared/utils/pagination.helper';
import { Customer } from './entities/customer.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma_service: PrismaService) {}

  async create(create_customer_dto: CreateCustomerDto): Promise<Customer> {
    try {
      return await this.prisma_service.customer.create({
        data: create_customer_dto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Customer with this email already exists',
          );
        }
      }
      throw error;
    }
  }

  async find_all(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Customer>> {
    const { skip, take } = PaginationHelper.getPaginationOptions(query);

    const [data, total] = await this.prisma_service.$transaction([
      this.prisma_service.customer.findMany({
        skip,
        take,
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma_service.customer.count(),
    ]);

    const meta = PaginationHelper.createPaginationMeta(
      total,
      query.page || 1,
      query.limit || 10,
    );

    return new PaginatedResponseDto(data, meta);
  }

  async find_one(id: number): Promise<Customer> {
    const customer = await this.prisma_service.customer.findUnique({
      where: { id },
      include: {
        orders: {
          take: 10,
          orderBy: {
            created_at: 'desc',
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async find_by_email(email: string): Promise<Customer | null> {
    return await this.prisma_service.customer.findUnique({
      where: { email },
    });
  }

  async update(
    id: number,
    update_customer_dto: UpdateCustomerDto,
  ): Promise<Customer> {
    await this.find_one(id); // Check if exists

    try {
      return await this.prisma_service.customer.update({
        where: { id },
        data: update_customer_dto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Customer with this email already exists',
          );
        }
      }
      throw error;
    }
  }

  async remove(id: number): Promise<Customer> {
    await this.find_one(id); // Check if exists

    // Check if customer has orders
    const order_count = await this.prisma_service.order.count({
      where: { customer_id: id },
    });

    if (order_count > 0) {
      throw new ConflictException(
        `Cannot delete customer with ${order_count} orders`,
      );
    }

    return await this.prisma_service.customer.delete({
      where: { id },
    });
  }
}
