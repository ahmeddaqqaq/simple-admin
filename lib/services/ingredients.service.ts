import { IngredientsService as ApiIngredientsService } from "@/lib/api";
import { Ingredient } from "@/lib/types/entities/ingredient";
import { BaseService } from "./base-service";

export class IngredientsService extends BaseService {
  private formDataToObject(formData: FormData) {
    const obj: any = {};

    // Get all field values
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const categoryId = formData.get("categoryId") as string;
    const image = formData.get("image") as File;

    // Add required fields
    obj.name = name;
    obj.categoryId = categoryId;

    // Add optional text fields
    if (description && description.trim()) {
      obj.description = description;
    }

    // Add numeric fields
    const calories = Number(formData.get("calories"));
    const carbs = Number(formData.get("carbs"));
    const fat = Number(formData.get("fat"));
    const protein = Number(formData.get("protein"));
    const baseServing = Number(formData.get("baseServing"));
    const plusAmount = Number(formData.get("plusAmount"));
    const pricePerPlus = Number(formData.get("pricePerPlus"));
    const basePrice = Number(formData.get("basePrice"));

    if (!isNaN(calories)) obj.calories = calories;
    if (!isNaN(carbs)) obj.carbs = carbs;
    if (!isNaN(fat)) obj.fat = fat;
    if (!isNaN(protein)) obj.protein = protein;
    if (!isNaN(baseServing)) obj.baseServing = baseServing;
    if (!isNaN(plusAmount)) obj.plusAmount = plusAmount;
    if (!isNaN(pricePerPlus)) obj.pricePerPlus = pricePerPlus;
    if (!isNaN(basePrice)) obj.basePrice = basePrice;

    // Add boolean fields
    obj.isNoneOption = formData.get("isNoneOption") === "true";
    obj.isActive = formData.get("isActive") === "true";

    // Add image if exists
    if (image && image.size > 0) {
      obj.image = image;
    }

    return obj;
  }

  async findAll(
    categoryId?: string,
    includeInactive?: boolean
  ): Promise<Ingredient[]> {
    return this.handleRequest<Ingredient[]>(
      ApiIngredientsService.ingredientsControllerFindAll(
        categoryId,
        includeInactive
      )
    );
  }

  async findOne(id: string): Promise<Ingredient> {
    return this.handleRequest<Ingredient>(
      ApiIngredientsService.ingredientsControllerFindOne(id)
    );
  }

  async create(formData: FormData): Promise<Ingredient> {
    const data = this.formDataToObject(formData);
    return this.handleRequest<Ingredient>(
      ApiIngredientsService.ingredientsControllerCreate(data)
    );
  }

  async update(id: string, formData: FormData): Promise<Ingredient> {
    const data = this.formDataToObject(formData);
    return this.handleRequest<Ingredient>(
      ApiIngredientsService.ingredientsControllerUpdate(id, data)
    );
  }

  async remove(id: string): Promise<void> {
    return this.handleRequest<void>(
      ApiIngredientsService.ingredientsControllerRemove(id)
    );
  }

  async toggleActive(id: string): Promise<Ingredient> {
    return this.handleRequest<Ingredient>(
      ApiIngredientsService.ingredientsControllerToggleActive(id)
    );
  }

  async uploadStopMotionImages(id: string, files: File[]): Promise<Ingredient> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    // Get the API base URL from environment or use default
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://api.simple-jo.com";

    // Get the access token from localStorage
    const token = localStorage.getItem("accessToken");

    // Manual API call since the endpoint is new and not yet in generated client
    const response = await fetch(
      `${apiUrl}/api/ingredients/${id}/stop-motion-images`,
      {
        method: "PATCH",
        body: formData,
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload stop motion images");
    }

    return response.json();
  }
}

export const ingredientsService = new IngredientsService();
