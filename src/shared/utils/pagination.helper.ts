import { PaginationMetaDto, PaginationQueryDto } from '../dto/pagination.dto';

export class PaginationHelper {
  static getPaginationOptions(query: PaginationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    return {
      skip,
      take: limit,
    };
  }

  static createPaginationMeta(
    total: number,
    page: number,
    limit: number,
  ): PaginationMetaDto {
    const total_pages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      total_pages,
      has_next_page: page < total_pages,
      has_previous_page: page > 1,
    };
  }
}
