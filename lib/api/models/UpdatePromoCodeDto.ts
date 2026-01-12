/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdatePromoCodeDto = {
    /**
     * Promo code (uppercase, alphanumeric)
     */
    code?: string;
    /**
     * Description for admins
     */
    description?: string;
    /**
     * Type of discount
     */
    discountType?: UpdatePromoCodeDto.discountType;
    /**
     * Discount value (percentage 0-100 or fixed amount in JOD)
     */
    discountValue?: number;
    /**
     * Max total usage across all customers
     */
    maxTotalUsage?: number;
    /**
     * Expiration date (ISO format)
     */
    expiresAt?: string;
    /**
     * One-time per customer
     */
    oneTimePerCustomer?: boolean;
    /**
     * Is active
     */
    isActive?: boolean;
};
export namespace UpdatePromoCodeDto {
    /**
     * Type of discount
     */
    export enum discountType {
        PERCENTAGE = 'PERCENTAGE',
        FIXED_AMOUNT = 'FIXED_AMOUNT',
    }
}

