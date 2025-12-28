export interface ReadyItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  type: 'SALAD' | 'SOUP' | 'DETOX';
  price: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ReadyItemListItem = Pick<ReadyItem, 'id' | 'name' | 'imageUrl' | 'type' | 'price' | 'isActive'>;
