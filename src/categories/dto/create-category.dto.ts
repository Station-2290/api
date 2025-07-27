import { OmitType } from '@nestjs/swagger';
import { Category } from '../entities/category.entity';

export class CreateCategoryDto extends OmitType(Category, [
  'id',
  'created_at',
  'updated_at',
]) {}
