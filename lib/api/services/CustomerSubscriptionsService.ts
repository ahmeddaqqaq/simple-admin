/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActivateSubscriptionDto } from '../models/ActivateSubscriptionDto';
import type { PurchaseSubscriptionDto } from '../models/PurchaseSubscriptionDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CustomerSubscriptionsService {
    /**
     * Purchase a subscription
     * @param requestBody
     * @returns any Subscription purchased successfully
     * @throws ApiError
     */
    public static customerSubscriptionsControllerPurchaseSubscription(
        requestBody: PurchaseSubscriptionDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/customer-subscriptions/purchase',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Activate subscription with code
     * @param id
     * @param requestBody
     * @returns any Subscription activated successfully
     * @throws ApiError
     */
    public static customerSubscriptionsControllerActivateSubscription(
        id: string,
        requestBody: ActivateSubscriptionDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/customer-subscriptions/{id}/activate',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get my subscriptions
     * @param status
     * @returns any List of customer subscriptions
     * @throws ApiError
     */
    public static customerSubscriptionsControllerGetMySubscriptions(
        status?: 'PENDING_PAYMENT' | 'PENDING_ACTIVATION' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/customer-subscriptions',
            query: {
                'status': status,
            },
        });
    }
    /**
     * Get subscription details
     * @param id
     * @returns any Subscription details
     * @throws ApiError
     */
    public static customerSubscriptionsControllerGetSubscriptionDetails(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/customer-subscriptions/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Cancel subscription
     * @param id
     * @returns any Subscription cancelled successfully
     * @throws ApiError
     */
    public static customerSubscriptionsControllerCancelSubscription(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/customer-subscriptions/{id}',
            path: {
                'id': id,
            },
        });
    }
}
