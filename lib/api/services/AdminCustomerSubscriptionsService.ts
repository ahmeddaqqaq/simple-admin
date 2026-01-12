/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminCustomerSubscriptionsService {
    /**
     * Get all customer subscriptions (Admin)
     * @param status
     * @param customerId
     * @returns any List of all subscriptions
     * @throws ApiError
     */
    public static customerSubscriptionsAdminControllerGetAllSubscriptions(
        status?: 'PENDING_PAYMENT' | 'PENDING_ACTIVATION' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED',
        customerId?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/customer-subscriptions',
            query: {
                'status': status,
                'customerId': customerId,
            },
        });
    }
    /**
     * Get subscription metrics (Admin)
     * @returns any Subscription metrics
     * @throws ApiError
     */
    public static customerSubscriptionsAdminControllerGetMetrics(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/customer-subscriptions/metrics',
        });
    }
    /**
     * Get subscription details (Admin)
     * @param id
     * @returns any Subscription details
     * @throws ApiError
     */
    public static customerSubscriptionsAdminControllerGetSubscriptionDetails(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/customer-subscriptions/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Confirm payment and send activation code (Admin)
     * @param id
     * @returns any Payment confirmed and activation code sent
     * @throws ApiError
     */
    public static customerSubscriptionsAdminControllerConfirmPaymentAndSendCode(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/customer-subscriptions/{id}/confirm-and-send-code',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Resend activation code (Admin)
     * @param id
     * @returns any Activation code resent
     * @throws ApiError
     */
    public static customerSubscriptionsAdminControllerResendActivationCode(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/customer-subscriptions/{id}/resend-code',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Cancel subscription (Admin)
     * @param id
     * @returns any Subscription cancelled
     * @throws ApiError
     */
    public static customerSubscriptionsAdminControllerCancelSubscription(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/admin/customer-subscriptions/{id}/cancel',
            path: {
                'id': id,
            },
        });
    }
}
