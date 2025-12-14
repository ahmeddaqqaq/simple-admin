/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateCategoryDto = {
    /**
     * Category name
     */
    name: string;
    /**
     * Category description
     */
    description?: string;
    /**
     * Category type
     */
    type: CreateCategoryDto.type;
    /**
     * Sort order for display
     */
    sortOrder?: number;
    /**
     * Is category active
     */
    isActive?: boolean;
};
export namespace CreateCategoryDto {
    /**
     * Category type
     */
    export enum type {
        BUILD_YOUR_MEAL = 'BUILD_YOUR_MEAL',
        SMOOTHIE = 'SMOOTHIE',
        READY_ITEM = 'READY_ITEM',
    }
}

