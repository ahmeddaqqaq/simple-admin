/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UploadService {
    /**
     * Upload a single file
     * Uploads a single image file to Wasabi S3 storage. Admin only.
     * @param formData
     * @returns any File uploaded successfully
     * @throws ApiError
     */
    public static uploadControllerUploadSingle(
        formData: {
            file: Blob;
            /**
             * Optional folder name (e.g., ingredients, ready-items)
             */
            folder?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/upload/single',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Invalid file type or size exceeds limit`,
            },
        });
    }
    /**
     * Upload multiple files
     * Uploads multiple image files to Wasabi S3 storage. Maximum 10 files. Admin only.
     * @param formData
     * @returns any Files uploaded successfully
     * @throws ApiError
     */
    public static uploadControllerUploadMultiple(
        formData: {
            files?: Array<Blob>;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/upload/multiple',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
}
