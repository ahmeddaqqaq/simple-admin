/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateLocationDto } from '../models/CreateLocationDto';
import type { UpdateCustomerDto } from '../models/UpdateCustomerDto';
import type { UpdateLocationDto } from '../models/UpdateLocationDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CustomersService {
    /**
     * Get customer profile
     * @returns any Customer profile
     * @throws ApiError
     */
    public static customersControllerGetProfile(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/customers/profile',
        });
    }
    /**
     * Update customer profile
     * @param requestBody
     * @returns any Profile updated successfully
     * @throws ApiError
     */
    public static customersControllerUpdateProfile(
        requestBody: UpdateCustomerDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/customers/profile',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get all customer locations
     * @returns any List of locations
     * @throws ApiError
     */
    public static customersControllerGetLocations(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/customers/locations',
        });
    }
    /**
     * Add a new location
     * @param requestBody
     * @returns any Location created successfully
     * @throws ApiError
     */
    public static customersControllerCreateLocation(
        requestBody: CreateLocationDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/customers/locations',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get a specific location
     * @param id
     * @returns any Location details
     * @throws ApiError
     */
    public static customersControllerGetLocation(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/customers/locations/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Location not found`,
            },
        });
    }
    /**
     * Update a location
     * @param id
     * @param requestBody
     * @returns any Location updated successfully
     * @throws ApiError
     */
    public static customersControllerUpdateLocation(
        id: string,
        requestBody: UpdateLocationDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/customers/locations/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete a location
     * @param id
     * @returns any Location deleted successfully
     * @throws ApiError
     */
    public static customersControllerDeleteLocation(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/customers/locations/{id}',
            path: {
                'id': id,
            },
        });
    }
}
