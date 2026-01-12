/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PromoCodeInfo } from './PromoCodeInfo';
export type ValidatePromoCodeResponseDto = {
    valid: boolean;
    message?: string;
    promoCode?: PromoCodeInfo;
    calculatedDiscount?: number;
};

