import { AdminGoldCoinsService as ApiGoldCoinsAdminService } from '@/lib/api';
import { BaseService } from './base-service';

export interface GoldCoinTransaction {
  id: string;
  type: 'EARNED' | 'SPENT' | 'REFUNDED' | 'ADJUSTED';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
  subscription?: {
    id: string;
    plan: {
      name: string;
    };
  };
  order?: {
    id: string;
    orderNumber: string;
  };
}

export interface CustomerBalance {
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    goldCoins: number;
  };
  balance: number;
  recentTransactions: GoldCoinTransaction[];
}

export interface AdjustGoldCoinsDto {
  customerId: string;
  amount: number;
  reason: string;
}

export class GoldCoinsService extends BaseService {
  async getCustomerBalance(customerId: string): Promise<CustomerBalance> {
    return this.handleRequest<CustomerBalance>(
      ApiGoldCoinsAdminService.goldCoinsAdminControllerGetCustomerBalance(customerId)
    );
  }

  async adjustBalance(dto: AdjustGoldCoinsDto): Promise<{ transaction: GoldCoinTransaction; newBalance: number }> {
    return this.handleRequest<{ transaction: GoldCoinTransaction; newBalance: number }>(
      ApiGoldCoinsAdminService.goldCoinsAdminControllerAdjustBalance(dto)
    );
  }
}

export const goldCoinsService = new GoldCoinsService();
