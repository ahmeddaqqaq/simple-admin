export interface Ingredient {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  stopMotionImages: string[];
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
  costPerGram: number;
  isNoneOption: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Dressing recommendations - which proteins this dressing is recommended with
  recommendedForProteins?: { id: string; name: string }[];
}

export type IngredientListItem = Pick<Ingredient, 'id' | 'name' | 'imageUrl' | 'category' | 'isActive'>;
