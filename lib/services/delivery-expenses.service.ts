import { BaseService } from './base-service';
import { getAuthToken } from '@/lib/apiConfig';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.simple-jo.com';

export interface DeliveryExpense {
  id: string;
  cost: number;
  deliveryLocation: string;
  createdAt: string;
}

export interface CreateDeliveryExpenseDto {
  cost: number;
  deliveryLocation: string;
}

class DeliveryExpensesServiceClass extends BaseService {
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getAuthToken();
    const response = await fetch(`${apiUrl}/api/delivery-expenses${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        statusText: response.statusText,
        body: error,
      };
    }

    return response.json();
  }

  async findAll(): Promise<DeliveryExpense[]> {
    return this.request<DeliveryExpense[]>('');
  }

  async create(dto: CreateDeliveryExpenseDto): Promise<DeliveryExpense> {
    return this.request<DeliveryExpense>('', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async remove(id: string): Promise<void> {
    await this.request(`/${id}`, {
      method: 'DELETE',
    });
  }
}

export const deliveryExpensesService = new DeliveryExpensesServiceClass();
