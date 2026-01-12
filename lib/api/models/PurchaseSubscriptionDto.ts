/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PurchaseSubscriptionDto = {
    /**
     * Subscription plan ID
     */
    planId: string;
    /**
     * Payment method (CASH_ON_DELIVERY, VISA_ON_DELIVERY, CLIQ)
     */
    paymentMethod: PurchaseSubscriptionDto.paymentMethod;
    /**
     * Additional notes for the purchase
     */
    notes?: string;
};
export namespace PurchaseSubscriptionDto {
    /**
     * Payment method (CASH_ON_DELIVERY, VISA_ON_DELIVERY, CLIQ)
     */
    export enum paymentMethod {
        VISA_ON_DELIVERY = 'VISA_ON_DELIVERY',
        CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
        CLIQ = 'CLIQ',
        GOLD_COINS = 'GOLD_COINS',
    }
}

