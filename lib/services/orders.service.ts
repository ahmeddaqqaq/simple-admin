import {
  OrdersService as ApiOrdersService,
  UpdateOrderStatusDto,
} from '@/lib/api';
import { OpenAPI } from '@/lib/api/core/OpenAPI';
import { request as __request } from '@/lib/api/core/request';
import { Order, OrderStatus } from '@/lib/types/entities/order';
import { BaseService } from './base-service';

export class OrdersService extends BaseService {
  async findAll(status?: OrderStatus, date?: string): Promise<Order[]> {
    // Use custom request to support date parameter
    return this.handleRequest<Order[]>(
      __request(OpenAPI, {
        method: 'GET',
        url: '/api/orders/admin/all',
        query: {
          status,
          date,
        },
      })
    );
  }

  async findOne(id: string): Promise<Order> {
    return this.handleRequest<Order>(
      ApiOrdersService.ordersControllerGetOrder(id)
    );
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
    notes?: string
  ): Promise<Order> {
    const dto: UpdateOrderStatusDto = {
      status: status as UpdateOrderStatusDto.status,
      notes,
    };
    return this.handleRequest<Order>(
      ApiOrdersService.ordersControllerUpdateOrderStatus(id, dto)
    );
  }
}

export const ordersService = new OrdersService();
