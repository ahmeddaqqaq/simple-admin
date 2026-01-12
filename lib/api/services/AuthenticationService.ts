/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginAdminDto } from '../models/LoginAdminDto';
import type { LoginCustomerDto } from '../models/LoginCustomerDto';
import type { RegisterCustomerDto } from '../models/RegisterCustomerDto';
import type { SendOtpDto } from '../models/SendOtpDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthenticationService {
    /**
     * Send OTP for customer registration
     * Sends a 4-digit OTP to the provided mobile number via SMS. The OTP is valid for 30 minutes and has a maximum of 3 attempts. Mobile number must be in Jordan format (962XXXXXXXXX).
     * @param requestBody
     * @returns any OTP sent successfully
     * @throws ApiError
     */
    public static authControllerSendRegistrationOtp(
        requestBody: SendOtpDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/customer/send-registration-otp',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid mobile number format`,
                409: `Customer with this mobile number already exists`,
            },
        });
    }
    /**
     * Send OTP for customer login
     * Sends a 4-digit OTP to the registered mobile number via SMS. The OTP is valid for 30 minutes.
     * @param requestBody
     * @returns any OTP sent successfully
     * @throws ApiError
     */
    public static authControllerSendLoginOtp(
        requestBody: SendOtpDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/customer/send-login-otp',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Customer not found or account deactivated`,
            },
        });
    }
    /**
     * Register a new customer
     * Registers a new customer using mobile number and OTP verification. Returns access and refresh tokens upon successful registration.
     * @param requestBody
     * @returns any Customer registered successfully
     * @throws ApiError
     */
    public static authControllerRegisterCustomer(
        requestBody: RegisterCustomerDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/customer/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid OTP or OTP expired`,
                409: `Customer already exists`,
            },
        });
    }
    /**
     * Customer login with OTP
     * Authenticates a customer using mobile number and OTP. Returns access and refresh tokens upon successful login.
     * @param requestBody
     * @returns any Customer logged in successfully
     * @throws ApiError
     */
    public static authControllerLoginCustomer(
        requestBody: LoginCustomerDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/customer/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid OTP or customer not found`,
                401: `Invalid OTP`,
            },
        });
    }
    /**
     * Admin login with username and password
     * Authenticates an admin using username and password. Returns access and refresh tokens upon successful login.
     * @param requestBody
     * @returns any Admin logged in successfully
     * @throws ApiError
     */
    public static authControllerLoginAdmin(
        requestBody: LoginAdminDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/admin/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Admin account deactivated`,
                401: `Invalid credentials`,
            },
        });
    }
    /**
     * Refresh access token
     * Generates a new access token and refresh token using a valid refresh token. The old refresh token will be invalidated.
     * @returns any Tokens refreshed successfully
     * @throws ApiError
     */
    public static authControllerRefreshTokens(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/refresh',
            errors: {
                401: `Invalid or expired refresh token`,
            },
        });
    }
    /**
     * Logout user
     * Logs out the current user by invalidating their refresh token. The access token will remain valid until expiry.
     * @param requestBody
     * @returns any Logged out successfully
     * @throws ApiError
     */
    public static authControllerLogout(
        requestBody: {
            /**
             * The refresh token to invalidate
             */
            refreshToken: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/logout',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized - Invalid or missing access token`,
            },
        });
    }
}
