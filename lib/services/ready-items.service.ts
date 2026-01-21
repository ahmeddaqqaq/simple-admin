import { ReadyItemsService as ApiReadyItemsService } from '@/lib/api';
import { ReadyItem } from '@/lib/types/entities/ready-item';
import { BaseService } from './base-service';

export class ReadyItemsService extends BaseService {
  private formDataToObject(formData: FormData) {
    const obj: any = {};

    // Get all field values
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string;
    const image = formData.get('image') as File;

    // Add required fields
    obj.name = name;
    obj.type = type;

    // Add optional text fields
    if (description && description.trim()) {
      obj.description = description;
    }

    // Add numeric fields
    const price = Number(formData.get('price'));
    const costPrice = Number(formData.get('costPrice'));
    const calories = Number(formData.get('calories'));
    const protein = Number(formData.get('protein'));
    const carbs = Number(formData.get('carbs'));
    const fat = Number(formData.get('fat'));

    if (!isNaN(price)) obj.price = price;
    if (!isNaN(costPrice)) obj.costPrice = costPrice;
    if (!isNaN(calories)) obj.calories = calories;
    if (!isNaN(protein)) obj.protein = protein;
    if (!isNaN(carbs)) obj.carbs = carbs;
    if (!isNaN(fat)) obj.fat = fat;

    // Add boolean fields
    obj.isActive = formData.get('isActive') === 'true';

    // Add image if exists
    if (image && image.size > 0) {
      obj.image = image;
    }

    return obj;
  }

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
    const data = this.formDataToObject(formData);
    return this.handleRequest<ReadyItem>(
      ApiReadyItemsService.readyItemsControllerCreate(data)
    );
  }

  async update(id: string, formData: FormData): Promise<ReadyItem> {
    const data = this.formDataToObject(formData);
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
