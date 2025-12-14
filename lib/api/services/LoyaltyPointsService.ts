/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LoyaltyPointsService {
    /**
     * Get my points balance and transaction history
     * @returns any Points balance and transaction history
     * @throws ApiError
     */
    public static pointsControllerGetMyPoints(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/points/my-points',
        });
    }
    /**
     * Get maximum discount I can get with my points
     * @returns any Maximum discount amount in JOD
     * @throws ApiError
     */
    public static pointsControllerGetMaximumDiscount(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/points/maximum-discount',
        });
    }
}
