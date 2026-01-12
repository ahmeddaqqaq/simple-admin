/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class IngredientsService {
    /**
     * Create a new ingredient with image upload (Admin only)
     * @param formData
     * @returns any Ingredient created successfully
     * @throws ApiError
     */
    public static ingredientsControllerCreate(
        formData: {
            /**
             * Ingredient image file
             */
            image?: Blob;
            name: string;
            categoryId: string;
            basePrice?: number;
            pricePerPlus?: number;
            calories?: number;
            protein?: number;
            carbs?: number;
            fats?: number;
            isActive?: boolean;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/ingredients',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * Get all ingredients
     * @param categoryId
     * @param includeInactive
     * @returns any List of ingredients
     * @throws ApiError
     */
    public static ingredientsControllerFindAll(
        categoryId?: string,
        includeInactive?: boolean,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/ingredients',
            query: {
                'categoryId': categoryId,
                'includeInactive': includeInactive,
            },
        });
    }
    /**
     * Get an ingredient by ID
     * @param id
     * @returns any Ingredient details
     * @throws ApiError
     */
    public static ingredientsControllerFindOne(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/ingredients/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Ingredient not found`,
            },
        });
    }
    /**
     * Update an ingredient with optional image upload (Admin only)
     * @param id
     * @param formData
     * @returns any Ingredient updated successfully
     * @throws ApiError
     */
    public static ingredientsControllerUpdate(
        id: string,
        formData: {
            /**
             * New ingredient image file (optional)
             */
            image?: Blob;
            name?: string;
            categoryId?: string;
            basePrice?: number;
            pricePerPlus?: number;
            calories?: number;
            protein?: number;
            carbs?: number;
            fats?: number;
            isActive?: boolean;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/ingredients/{id}',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * Delete an ingredient (Admin only)
     * @param id
     * @returns any Ingredient deleted successfully
     * @throws ApiError
     */
    public static ingredientsControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/ingredients/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Toggle ingredient active status (Admin only)
     * @param id
     * @returns any Ingredient status toggled
     * @throws ApiError
     */
    public static ingredientsControllerToggleActive(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/ingredients/{id}/toggle-active',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Upload stop motion images for ingredient (Admin only)
     * @param id
     * @param formData
     * @returns any Stop motion images uploaded successfully
     * @throws ApiError
     */
    public static ingredientsControllerUpdateStopMotionImages(
        id: string,
        formData: {
            /**
             * Stop motion image files (up to 10)
             */
            images?: Array<Blob>;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/ingredients/{id}/stop-motion-images',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
}
