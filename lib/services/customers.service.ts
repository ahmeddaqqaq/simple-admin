import { BaseService } from './base-service';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  points: number;
  goldCoins: number;
  isActive: boolean;
  createdAt: string;
  _count: {
    orders: number;
    subscriptions: number;
  };
}

export interface CustomerLocation {
  id: string;
  nickname: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

export interface CustomerSubscriptionSummary {
  id: string;
  status: string;
  createdAt: string;
  expiresAt: string | null;
  plan: {
    id: string;
    name: string;
    price: number;
  };
}

export interface CustomerPointsTransaction {
  id: string;
  type: 'EARNED' | 'REDEEMED' | 'ADJUSTED' | 'EXPIRED';
  amount: number;
  description: string;
  createdAt: string;
}

export interface CustomerGoldCoinTransaction {
  id: string;
  type: 'EARNED' | 'SPENT' | 'REFUNDED' | 'ADJUSTED';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

export interface CustomerDetails extends Omit<Customer, '_count'> {
  locations: CustomerLocation[];
  orders: CustomerOrder[];
  subscriptions: CustomerSubscriptionSummary[];
  pointsTransactions: CustomerPointsTransaction[];
  goldCoinTransactions: CustomerGoldCoinTransaction[];
  _count: {
    orders: number;
    subscriptions: number;
    pointsTransactions: number;
    goldCoinTransactions: number;
  };
  stats: {
    totalOrders: number;
    totalSpent: number;
  };
}

export interface CustomersResponse {
  data: Customer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FindAllParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export class CustomersService extends BaseService {
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

  async findAll(params: FindAllParams = {}): Promise<CustomersResponse> {
    const { search, isActive, page = 1, limit = 20 } = params;

    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (isActive !== undefined) queryParams.append('isActive', String(isActive));
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));

    const response = await fetch(
      `${this.getApiUrl()}/api/admin/customers?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch customers');
    }

    return response.json();
  }

  async findOne(id: string): Promise<CustomerDetails> {
    const response = await fetch(
      `${this.getApiUrl()}/api/admin/customers/${id}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch customer');
    }

    return response.json();
  }

  async toggleActive(id: string): Promise<{ id: string; firstName: string; lastName: string; isActive: boolean }> {
    const response = await fetch(
      `${this.getApiUrl()}/api/admin/customers/${id}/toggle-active`,
      {
        method: 'PATCH',
        headers: this.getHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to toggle customer status');
    }

    return response.json();
  }
}

export const customersService = new CustomersService();
