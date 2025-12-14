import {
  OrdersService as ApiOrdersService,
  UpdateOrderStatusDto,
} from '@/lib/api';
import { Order, OrderStatus } from '@/lib/types/entities/order';
import { BaseService } from './base-service';

export class OrdersService extends BaseService {
  async findAll(status?: OrderStatus): Promise<Order[]> {
    return this.handleRequest<Order[]>(
      ApiOrdersService.ordersControllerGetAllOrders(status)
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
