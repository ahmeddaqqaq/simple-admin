/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdjustGoldCoinsDto } from '../models/AdjustGoldCoinsDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminGoldCoinsService {
    /**
     * Manually adjust customer gold coin balance (Admin)
     * @param requestBody
     * @returns any Balance adjusted successfully
     * @throws ApiError
     */
    public static goldCoinsAdminControllerAdjustBalance(
        requestBody: AdjustGoldCoinsDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/gold-coins/adjust',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get customer gold coin balance and history (Admin)
     * @param customerId
     * @returns any Customer balance and transactions
     * @throws ApiError
     */
    public static goldCoinsAdminControllerGetCustomerBalance(
        customerId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/gold-coins/customer/{customerId}',
            path: {
                'customerId': customerId,
            },
        });
    }
}
