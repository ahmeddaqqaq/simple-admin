/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AdjustGoldCoinsDto = {
    /**
     * Customer ID
     */
    customerId: string;
    /**
     * Amount to adjust (positive to add, negative to subtract)
     */
    amount: number;
    /**
     * Reason for adjustment
     */
    reason: string;
};

