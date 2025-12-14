/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateOrderDto } from '../models/CreateOrderDto';
import type { UpdateOrderStatusDto } from '../models/UpdateOrderStatusDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OrdersService {
    /**
     * Place an order from cart
     * @param requestBody
     * @returns any Order created successfully
     * @throws ApiError
     */
    public static ordersControllerCreateOrder(
        requestBody: CreateOrderDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/orders',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Cart is empty`,
            },
        });
    }
    /**
     * Get customer order history
     * @returns any List of customer orders
     * @throws ApiError
     */
    public static ordersControllerGetMyOrders(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/orders/my-orders',
        });
    }
    /**
     * Get all orders (Admin only)
     * @param status
     * @returns any List of all orders
     * @throws ApiError
     */
    public static ordersControllerGetAllOrders(
        status?: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'IN_PROGRESS' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/orders/admin/all',
            query: {
                'status': status,
            },
        });
    }
    /**
     * Get order details
     * @param id
     * @returns any Order details
     * @throws ApiError
     */
    public static ordersControllerGetOrder(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/orders/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Order not found`,
            },
        });
    }
    /**
     * Update order status (Admin only)
     * @param id
     * @param requestBody
     * @returns any Order status updated
     * @throws ApiError
     */
    public static ordersControllerUpdateOrderStatus(
        id: string,
        requestBody: UpdateOrderStatusDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/orders/{id}/status',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
