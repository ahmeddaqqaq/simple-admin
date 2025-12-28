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
    const priceStr = formData.get('price') as string;
    const caloriesStr = formData.get('calories') as string;
    const proteinStr = formData.get('protein') as string;
    const carbsStr = formData.get('carbs') as string;
    const fatStr = formData.get('fat') as string;

    const data: any = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      type: formData.get('type') as string,
      price: parseFloat(priceStr) || 0,
      isActive: formData.get('isActive') === 'true',
    };

    // Only add optional numeric fields if they have valid values
    const calories = parseFloat(caloriesStr);
    if (!isNaN(calories) && calories > 0) {
      data.calories = calories;
    }

    const protein = parseFloat(proteinStr);
    if (!isNaN(protein) && protein > 0) {
      data.protein = protein;
    }

    const carbs = parseFloat(carbsStr);
    if (!isNaN(carbs) && carbs > 0) {
      data.carbs = carbs;
    }

    const fat = parseFloat(fatStr);
    if (!isNaN(fat) && fat > 0) {
      data.fat = fat;
    }

    // Only add image if it exists and has content
    if (image && (image as File).size > 0) {
      data.image = image as Blob;
    }

    return this.handleRequest<ReadyItem>(
      ApiReadyItemsService.readyItemsControllerCreate(data)
    );
  }

  async update(id: string, formData: FormData): Promise<ReadyItem> {
    const priceStr = formData.get('price') as string;
    const caloriesStr = formData.get('calories') as string;
    const proteinStr = formData.get('protein') as string;
    const carbsStr = formData.get('carbs') as string;
    const fatStr = formData.get('fat') as string;

    const data: any = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      type: formData.get('type') as string,
      isActive: formData.get('isActive') === 'true',
    };

    // Only add numeric fields if they have valid values
    const price = parseFloat(priceStr);
    if (!isNaN(price) && price >= 0) {
      data.price = price;
    }

    const calories = parseFloat(caloriesStr);
    if (!isNaN(calories) && calories > 0) {
      data.calories = calories;
    }

    const protein = parseFloat(proteinStr);
    if (!isNaN(protein) && protein > 0) {
      data.protein = protein;
    }

    const carbs = parseFloat(carbsStr);
    if (!isNaN(carbs) && carbs > 0) {
      data.carbs = carbs;
    }

    const fat = parseFloat(fatStr);
    if (!isNaN(fat) && fat > 0) {
      data.fat = fat;
    }

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
