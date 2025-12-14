import {
  CategoriesService as ApiCategoriesService,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@/lib/api';
import { Category } from '@/lib/types/entities/category';
import { BaseService } from './base-service';

export class CategoriesService extends BaseService {
  async findAll(
    type?: 'BUILD_YOUR_MEAL' | 'SMOOTHIE' | 'READY_ITEM',
    includeInactive?: boolean
  ): Promise<Category[]> {
    return this.handleRequest<Category[]>(
      ApiCategoriesService.categoriesControllerFindAll(type, includeInactive)
    );
  }

  async findOne(id: string): Promise<Category> {
    return this.handleRequest<Category>(
      ApiCategoriesService.categoriesControllerFindOne(id)
    );
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    return this.handleRequest<Category>(
      ApiCategoriesService.categoriesControllerCreate(dto)
    );
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    return this.handleRequest<Category>(
      ApiCategoriesService.categoriesControllerUpdate(id, dto)
    );
  }

  async remove(id: string): Promise<void> {
    return this.handleRequest<void>(
      ApiCategoriesService.categoriesControllerRemove(id)
    );
  }

  async toggleActive(id: string): Promise<Category> {
    return this.handleRequest<Category>(
      ApiCategoriesService.categoriesControllerToggleActive(id)
    );
  }
}

export const categoriesService = new CategoriesService();
