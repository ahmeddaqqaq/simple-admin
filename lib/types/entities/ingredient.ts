export interface Ingredient {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
  baseServing: number;
  plusAmount: number;
  pricePerPlus: number;
  basePrice: number;
  isNoneOption: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type IngredientListItem = Pick<Ingredient, 'id' | 'name' | 'imageUrl' | 'category' | 'isActive'>;
