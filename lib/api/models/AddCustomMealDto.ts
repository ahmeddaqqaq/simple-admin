/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MealIngredientDto } from './MealIngredientDto';
export type AddCustomMealDto = {
    /**
     * Array of ingredients for the meal
     */
    ingredients: Array<MealIngredientDto>;
    /**
     * Quantity
     */
    quantity: number;
};

