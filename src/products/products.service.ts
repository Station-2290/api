import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/shared/modules/prisma';
import {
  PaginationQueryDto,
  PaginatedResponseDto,
} from 'src/shared/dto/pagination.dto';
import { PaginationHelper } from 'src/shared/utils/pagination.helper';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    return this.prismaService.product.create({
      data: createProductDto,
      include: {
        category: true,
      },
    });
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Product>> {
    const { skip, take } = PaginationHelper.getPaginationOptions(query);

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.product.findMany({
        skip,
        take,
        include: {
          category: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prismaService.product.count(),
    ]);

    const meta = PaginationHelper.createPaginationMeta(
      total,
      query.page || 1,
      query.limit || 10,
    );

    return new PaginatedResponseDto(data, meta);
  }

  async findOne(id: number) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id); // Check if exists

    return this.prismaService.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        category: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Check if exists

    return this.prismaService.product.delete({
      where: { id },
      include: {
        category: true,
      },
    });
  }
}
