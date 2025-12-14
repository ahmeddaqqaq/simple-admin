/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateCategoryDto } from '../models/CreateCategoryDto';
import type { UpdateCategoryDto } from '../models/UpdateCategoryDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CategoriesService {
    /**
     * Create a new category (Admin only)
     * @param requestBody
     * @returns any Category created successfully
     * @throws ApiError
     */
    public static categoriesControllerCreate(
        requestBody: CreateCategoryDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/categories',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get all categories
     * @param type
     * @param includeInactive
     * @returns any List of categories
     * @throws ApiError
     */
    public static categoriesControllerFindAll(
        type?: 'BUILD_YOUR_MEAL' | 'SMOOTHIE' | 'READY_ITEM',
        includeInactive?: boolean,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/categories',
            query: {
                'type': type,
                'includeInactive': includeInactive,
            },
        });
    }
    /**
     * Get a category by ID
     * @param id
     * @returns any Category details
     * @throws ApiError
     */
    public static categoriesControllerFindOne(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/categories/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Category not found`,
            },
        });
    }
    /**
     * Update a category (Admin only)
     * @param id
     * @param requestBody
     * @returns any Category updated successfully
     * @throws ApiError
     */
    public static categoriesControllerUpdate(
        id: string,
        requestBody: UpdateCategoryDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/categories/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Category not found`,
            },
        });
    }
    /**
     * Delete a category (Admin only)
     * @param id
     * @returns any Category deleted successfully
     * @throws ApiError
     */
    public static categoriesControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/categories/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Category not found`,
            },
        });
    }
    /**
     * Toggle category active status (Admin only)
     * @param id
     * @returns any Category status toggled
     * @throws ApiError
     */
    public static categoriesControllerToggleActive(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/categories/{id}/toggle-active',
            path: {
                'id': id,
            },
        });
    }
}
