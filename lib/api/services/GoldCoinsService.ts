/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GoldCoinsService {
    /**
     * Get my gold coin balance
     * @returns any Balance and recent transactions
     * @throws ApiError
     */
    public static goldCoinsControllerGetBalance(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/gold-coins/balance',
        });
    }
    /**
     * Get transaction history
     * @param limit
     * @param offset
     * @returns any Transaction history
     * @throws ApiError
     */
    public static goldCoinsControllerGetTransactionHistory(
        limit?: number,
        offset?: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/gold-coins/transactions',
            query: {
                'limit': limit,
                'offset': offset,
            },
        });
    }
}
