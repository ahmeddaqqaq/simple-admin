/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateSubscriptionPlanDto = {
    /**
     * Subscription plan name
     */
    name?: string;
    /**
     * Description for the subscription plan
     */
    description?: string;
    /**
     * Number of gold coins required for this plan
     */
    coinCost?: number;
    /**
     * Subscription duration in days
     */
    validityDays?: number;
    /**
     * Array of feature strings
     */
    features?: Array<string>;
    /**
     * Sort order for display
     */
    sortOrder?: number;
    /**
     * Is plan active
     */
    isActive?: boolean;
};

