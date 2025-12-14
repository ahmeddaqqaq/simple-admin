export interface ReadyItem {
  id: string;
  name: string;
  description: string;
  image: string;
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

export type ReadyItemListItem = Pick<ReadyItem, 'id' | 'name' | 'image' | 'type' | 'price' | 'isActive'>;
