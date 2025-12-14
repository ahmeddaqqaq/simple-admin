import { ReadyItemsService as ApiReadyItemsService } from '@/lib/api';
import { ReadyItem } from '@/lib/types/entities/ready-item';
import { BaseService } from './base-service';

export class ReadyItemsService extends BaseService {
  async findAll(
    type?: 'SALAD' | 'SOUP' | 'DETOX',
    includeInactive?: boolean
  ): Promise<ReadyItem[]> {
    return this.handleRequest<ReadyItem[]>(
      ApiReadyItemsService.readyItemsControllerFindAll(type, includeInactive)
    );
  }

  async findOne(id: string): Promise<ReadyItem> {
    return this.handleRequest<ReadyItem>(
      ApiReadyItemsService.readyItemsControllerFindOne(id)
    );
  }

  async create(formData: FormData): Promise<ReadyItem> {
    const image = formData.get('image');
    const data: any = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      type: formData.get('type') as string,
      price: parseFloat(formData.get('price') as string) || 0,
      calories: parseFloat(formData.get('calories') as string) || 0,
      protein: parseFloat(formData.get('protein') as string) || 0,
      carbs: parseFloat(formData.get('carbs') as string) || 0,
      fat: parseFloat(formData.get('fat') as string) || 0,
      isActive: formData.get('isActive') === 'true',
    };

    // Only add image if it exists and has content
    if (image && (image as File).size > 0) {
      data.image = image as Blob;
    }

    return this.handleRequest<ReadyItem>(
      ApiReadyItemsService.readyItemsControllerCreate(data)
    );
  }

  async update(id: string, formData: FormData): Promise<ReadyItem> {
    const data: any = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      type: formData.get('type') as string,
      price: parseFloat(formData.get('price') as string) || 0,
      calories: parseFloat(formData.get('calories') as string) || 0,
      protein: parseFloat(formData.get('protein') as string) || 0,
      carbs: parseFloat(formData.get('carbs') as string) || 0,
      fat: parseFloat(formData.get('fat') as string) || 0,
      isActive: formData.get('isActive') === 'true',
    };
    const image = formData.get('image');
    if (image && (image as File).size > 0) {
      data.image = image as Blob;
    }
    return this.handleRequest<ReadyItem>(
      ApiReadyItemsService.readyItemsControllerUpdate(id, data)
    );
  }

  async remove(id: string): Promise<void> {
    return this.handleRequest<void>(
      ApiReadyItemsService.readyItemsControllerRemove(id)
    );
  }

  async toggleActive(id: string): Promise<ReadyItem> {
    return this.handleRequest<ReadyItem>(
      ApiReadyItemsService.readyItemsControllerToggleActive(id)
    );
  }
}

export const readyItemsService = new ReadyItemsService();
