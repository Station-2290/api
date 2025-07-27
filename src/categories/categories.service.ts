import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/shared/modules/prisma';
import {
  PaginationQueryDto,
  PaginatedResponseDto,
} from 'src/shared/dto/pagination.dto';
import { PaginationHelper } from 'src/shared/utils/pagination.helper';
import { Category } from './entities/category.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma_service: PrismaService) {}

  async create(create_category_dto: CreateCategoryDto): Promise<Category> {
    try {
      return await this.prisma_service.category.create({
        data: create_category_dto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Category with this name or slug already exists',
          );
        }
      }
      throw error;
    }
  }

  async find_all(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Category>> {
    const { skip, take } = PaginationHelper.getPaginationOptions(query);

    const [data, total] = await this.prisma_service.$transaction([
      this.prisma_service.category.findMany({
        skip,
        take,
        orderBy: [{ display_order: 'asc' }, { name: 'asc' }],
        where: {
          is_active: true,
        },
      }),
      this.prisma_service.category.count({
        where: {
          is_active: true,
        },
      }),
    ]);

    const meta = PaginationHelper.createPaginationMeta(
      total,
      query.page || 1,
      query.limit || 10,
    );

    return new PaginatedResponseDto(data, meta);
  }

  async find_one(id: number): Promise<Category> {
    const category = await this.prisma_service.category.findUnique({
      where: { id },
      include: {
        products: {
          where: {
            is_active: true,
          },
          take: 10,
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(
    id: number,
    update_category_dto: UpdateCategoryDto,
  ): Promise<Category> {
    await this.find_one(id); // Check if exists

    try {
      return await this.prisma_service.category.update({
        where: { id },
        data: update_category_dto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Category with this name or slug already exists',
          );
        }
      }
      throw error;
    }
  }

  async remove(id: number): Promise<Category> {
    await this.find_one(id); // Check if exists

    // Check if category has products
    const product_count = await this.prisma_service.product.count({
      where: { category_id: id },
    });

    if (product_count > 0) {
      throw new ConflictException(
        `Cannot delete category with ${product_count} products`,
      );
    }

    return await this.prisma_service.category.delete({
      where: { id },
    });
  }
}
