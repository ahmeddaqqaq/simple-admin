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

export interface Subscriber {
  id: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  goldCoins: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalPaid: number;
  subscriptions: {
    id: string;
    status: string;
    pricePaid: number;
    coinsAwarded: number;
    paymentConfirmedAt: string | null;
    plan: {
      name: string;
    };
  }[];
}

export class GoldCoinsService extends BaseService {
  private getApiUrl() {
    return process.env.NEXT_PUBLIC_API_URL || 'https://api.simple-jo.com';
  }

  private getHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

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

  async getSubscribersList(): Promise<Subscriber[]> {
    const response = await fetch(
      `${this.getApiUrl()}/api/admin/gold-coins/subscribers`,
      {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch subscribers list');
    }

    return response.json();
  }
}

export const goldCoinsService = new GoldCoinsService();
