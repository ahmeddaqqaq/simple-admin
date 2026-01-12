/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PromoCodeInfo = {
    id: string;
    code: string;
    discountType: PromoCodeInfo.discountType;
    discountValue: number;
};
export namespace PromoCodeInfo {
    export enum discountType {
        PERCENTAGE = 'PERCENTAGE',
        FIXED_AMOUNT = 'FIXED_AMOUNT',
    }
}

