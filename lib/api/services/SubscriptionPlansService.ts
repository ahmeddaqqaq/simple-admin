/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateSubscriptionPlanDto } from '../models/CreateSubscriptionPlanDto';
import type { UpdateSubscriptionPlanDto } from '../models/UpdateSubscriptionPlanDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SubscriptionPlansService {
    /**
     * Create a new subscription plan (Admin only)
     * @param requestBody
     * @returns any Subscription plan created successfully
     * @throws ApiError
     */
    public static subscriptionPlansControllerCreate(
        requestBody: CreateSubscriptionPlanDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/subscription-plans',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get all subscription plans (Admin only)
     * @param includeInactive
     * @returns any List of subscription plans
     * @throws ApiError
     */
    public static subscriptionPlansControllerFindAll(
        includeInactive?: boolean,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/subscription-plans',
            query: {
                'includeInactive': includeInactive,
            },
        });
    }
    /**
     * Get active subscription plans for customers
     * @returns any List of active subscription plans
     * @throws ApiError
     */
    public static subscriptionPlansControllerFindActive(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/subscription-plans/active',
        });
    }
    /**
     * Get a single subscription plan by ID
     * @param id
     * @returns any Subscription plan details
     * @throws ApiError
     */
    public static subscriptionPlansControllerFindOne(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/subscription-plans/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Update a subscription plan (Admin only)
     * @param id
     * @param requestBody
     * @returns any Subscription plan updated successfully
     * @throws ApiError
     */
    public static subscriptionPlansControllerUpdate(
        id: string,
        requestBody: UpdateSubscriptionPlanDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/subscription-plans/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Soft delete a subscription plan (Admin only)
     * @param id
     * @returns any Subscription plan deleted successfully
     * @throws ApiError
     */
    public static subscriptionPlansControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/subscription-plans/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Toggle subscription plan active status (Admin only)
     * @param id
     * @returns any Status toggled successfully
     * @throws ApiError
     */
    public static subscriptionPlansControllerToggleActive(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/subscription-plans/{id}/toggle-active',
            path: {
                'id': id,
            },
        });
    }
}
