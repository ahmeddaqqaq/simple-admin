/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddCustomMealDto } from '../models/AddCustomMealDto';
import type { AddReadyItemDto } from '../models/AddReadyItemDto';
import type { AddSmoothieDto } from '../models/AddSmoothieDto';
import type { UpdateCartItemDto } from '../models/UpdateCartItemDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CartService {
    /**
     * Get cart with all items and prices
     * @returns any Cart details with calculated prices
     * @throws ApiError
     */
    public static cartControllerGetCart(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/cart',
        });
    }
    /**
     * Clear cart (remove all items)
     * @returns any Cart cleared
     * @throws ApiError
     */
    public static cartControllerClearCart(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/cart',
        });
    }
    /**
     * Add a custom meal to cart
     * @param requestBody
     * @returns any Custom meal added to cart
     * @throws ApiError
     */
    public static cartControllerAddCustomMeal(
        requestBody: AddCustomMealDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/cart/custom-meal',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Add a smoothie to cart
     * @param requestBody
     * @returns any Smoothie added to cart
     * @throws ApiError
     */
    public static cartControllerAddSmoothie(
        requestBody: AddSmoothieDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/cart/smoothie',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Add a ready item to cart
     * @param requestBody
     * @returns any Ready item added to cart
     * @throws ApiError
     */
    public static cartControllerAddReadyItem(
        requestBody: AddReadyItemDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/cart/ready-item',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Update cart item quantity
     * @param itemId
     * @param requestBody
     * @returns any Cart item updated
     * @throws ApiError
     */
    public static cartControllerUpdateItem(
        itemId: string,
        requestBody: UpdateCartItemDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/cart/items/{itemId}',
            path: {
                'itemId': itemId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Remove item from cart
     * @param itemId
     * @returns any Item removed from cart
     * @throws ApiError
     */
    public static cartControllerRemoveItem(
        itemId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/cart/items/{itemId}',
            path: {
                'itemId': itemId,
            },
        });
    }
}
