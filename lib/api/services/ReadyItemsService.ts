/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReadyItemsService {
    /**
     * Create a new ready item with image upload (Admin only)
     * @param formData
     * @returns any Ready item created successfully
     * @throws ApiError
     */
    public static readyItemsControllerCreate(
        formData: {
            /**
             * Ready item image file
             */
            image?: Blob;
            name: string;
            description?: string;
            type: 'SALAD' | 'SOUP' | 'DETOX';
            price: number;
            calories?: number;
            protein?: number;
            carbs?: number;
            fat?: number;
            isActive?: boolean;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/ready-items',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * Get all ready items
     * @param type
     * @param includeInactive
     * @returns any List of ready items
     * @throws ApiError
     */
    public static readyItemsControllerFindAll(
        type?: 'SALAD' | 'SOUP' | 'DETOX',
        includeInactive?: boolean,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/ready-items',
            query: {
                'type': type,
                'includeInactive': includeInactive,
            },
        });
    }
    /**
     * Get a ready item by ID
     * @param id
     * @returns any Ready item details
     * @throws ApiError
     */
    public static readyItemsControllerFindOne(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/ready-items/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Ready item not found`,
            },
        });
    }
    /**
     * Update a ready item with optional image upload (Admin only)
     * @param id
     * @param formData
     * @returns any Ready item updated successfully
     * @throws ApiError
     */
    public static readyItemsControllerUpdate(
        id: string,
        formData: {
            /**
             * New ready item image file (optional)
             */
            image?: Blob;
            name?: string;
            description?: string;
            type?: 'SALAD' | 'SOUP' | 'DETOX';
            price?: number;
            calories?: number;
            protein?: number;
            carbs?: number;
            fat?: number;
            isActive?: boolean;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/ready-items/{id}',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * Delete a ready item (Admin only)
     * @param id
     * @returns any Ready item deleted successfully
     * @throws ApiError
     */
    public static readyItemsControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/ready-items/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Toggle ready item active status (Admin only)
     * @param id
     * @returns any Ready item status toggled
     * @throws ApiError
     */
    public static readyItemsControllerToggleActive(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/ready-items/{id}/toggle-active',
            path: {
                'id': id,
            },
        });
    }
}
