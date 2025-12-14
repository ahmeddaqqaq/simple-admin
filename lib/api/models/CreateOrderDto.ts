/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateOrderDto = {
    /**
     * Customer location ID
     */
    locationId: string;
    /**
     * Payment method
     */
    paymentMethod: CreateOrderDto.paymentMethod;
    /**
     * Points to use for discount (minimum 100 points, 100 points = 1 JOD)
     */
    pointsToUse?: number;
    /**
     * Order notes
     */
    notes?: string;
};
export namespace CreateOrderDto {
    /**
     * Payment method
     */
    export enum paymentMethod {
        VISA_ON_DELIVERY = 'VISA_ON_DELIVERY',
        CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
        CLIQ = 'CLIQ',
    }
}

