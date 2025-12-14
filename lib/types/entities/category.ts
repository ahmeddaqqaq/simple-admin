export interface Category {
  id: string;
  name: string;
  description?: string;
  type: 'BUILD_YOUR_MEAL' | 'SMOOTHIE' | 'READY_ITEM';
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CategoryListItem = Pick<Category, 'id' | 'name' | 'type' | 'isActive'>;
