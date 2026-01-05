/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class PromoCodesService {
    /**
     * Get all promo codes (Admin only)
     * @returns any List of promo codes
     * @throws ApiError
     */
    public static promoCodesControllerFindAll(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/promo-codes',
        });
    }

    /**
     * Get a promo code by ID (Admin only)
     * @param id
     * @returns any Promo code details
     * @throws ApiError
     */
    public static promoCodesControllerFindOne(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/promo-codes/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Promo code not found`,
            },
        });
    }

    /**
     * Create a new promo code (Admin only)
     * @param requestBody
     * @returns any Promo code created successfully
     * @throws ApiError
     */
    public static promoCodesControllerCreate(
        requestBody: {
            code: string;
            description?: string;
            discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
            discountValue: number;
            maxTotalUsage?: number;
            expiresAt?: string;
            oneTimePerCustomer?: boolean;
            isActive?: boolean;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/promo-codes',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Update a promo code (Admin only)
     * @param id
     * @param requestBody
     * @returns any Promo code updated successfully
     * @throws ApiError
     */
    public static promoCodesControllerUpdate(
        id: string,
        requestBody: {
            code?: string;
            description?: string;
            discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
            discountValue?: number;
            maxTotalUsage?: number;
            expiresAt?: string;
            oneTimePerCustomer?: boolean;
            isActive?: boolean;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/promo-codes/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Promo code not found`,
            },
        });
    }

    /**
     * Delete a promo code (Admin only)
     * @param id
     * @returns any Promo code deleted successfully
     * @throws ApiError
     */
    public static promoCodesControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/promo-codes/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Promo code not found`,
            },
        });
    }

    /**
     * Toggle promo code active status (Admin only)
     * @param id
     * @returns any Promo code status toggled
     * @throws ApiError
     */
    public static promoCodesControllerToggleActive(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/promo-codes/{id}/toggle-active',
            path: {
                'id': id,
            },
        });
    }
}
