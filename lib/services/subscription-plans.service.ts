import { SubscriptionPlansService as ApiSubscriptionPlansService } from '@/lib/api';
import { BaseService } from './base-service';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  coinCost: number;
  price: number;
  validityDays: number;
  features?: string[];
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionPlanDto {
  name: string;
  description?: string;
  coinCost: number;
  price: number;
  validityDays: number;
  features?: string[];
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateSubscriptionPlanDto {
  name?: string;
  description?: string;
  coinCost?: number;
  price?: number;
  validityDays?: number;
  features?: string[];
  sortOrder?: number;
  isActive?: boolean;
}

export class SubscriptionPlansService extends BaseService {
  async findAll(includeInactive?: boolean): Promise<SubscriptionPlan[]> {
    return this.handleRequest<SubscriptionPlan[]>(
      ApiSubscriptionPlansService.subscriptionPlansControllerFindAll(includeInactive)
    );
  }

  async findOne(id: string): Promise<SubscriptionPlan> {
    return this.handleRequest<SubscriptionPlan>(
      ApiSubscriptionPlansService.subscriptionPlansControllerFindOne(id)
    );
  }

  async create(dto: CreateSubscriptionPlanDto): Promise<SubscriptionPlan> {
    return this.handleRequest<SubscriptionPlan>(
      ApiSubscriptionPlansService.subscriptionPlansControllerCreate(dto)
    );
  }

  async update(id: string, dto: UpdateSubscriptionPlanDto): Promise<SubscriptionPlan> {
    return this.handleRequest<SubscriptionPlan>(
      ApiSubscriptionPlansService.subscriptionPlansControllerUpdate(id, dto)
    );
  }

  async remove(id: string): Promise<void> {
    return this.handleRequest<void>(
      ApiSubscriptionPlansService.subscriptionPlansControllerRemove(id)
    );
  }

  async toggleActive(id: string): Promise<SubscriptionPlan> {
    return this.handleRequest<SubscriptionPlan>(
      ApiSubscriptionPlansService.subscriptionPlansControllerToggleActive(id)
    );
  }
}

export const subscriptionPlansService = new SubscriptionPlansService();
