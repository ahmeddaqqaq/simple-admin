export interface SaladAddOn {
  id: string;
  readyItemId: string;
  ingredientId: string;
  price: number;
  ingredient: {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface ReadyItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  type: 'SALAD' | 'SOUP' | 'DETOX';
  price: number;
  costPrice: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  allowAddOns: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  availableAddOns?: SaladAddOn[];
}

export type ReadyItemListItem = Pick<ReadyItem, 'id' | 'name' | 'imageUrl' | 'type' | 'price' | 'isActive' | 'allowAddOns'>;
