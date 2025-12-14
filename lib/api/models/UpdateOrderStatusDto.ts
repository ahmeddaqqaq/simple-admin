/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateOrderStatusDto = {
    /**
     * New order status
     */
    status: UpdateOrderStatusDto.status;
    /**
     * Status change notes
     */
    notes?: string;
};
export namespace UpdateOrderStatusDto {
    /**
     * New order status
     */
    export enum status {
        PENDING = 'PENDING',
        CONFIRMED = 'CONFIRMED',
        PREPARING = 'PREPARING',
        IN_PROGRESS = 'IN_PROGRESS',
        OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
        DELIVERED = 'DELIVERED',
        CANCELLED = 'CANCELLED',
    }
}

