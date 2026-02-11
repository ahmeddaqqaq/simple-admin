import { BaseService } from './base-service';
import { getAuthToken } from '@/lib/apiConfig';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.simple-jo.com';

export interface OperationalCost {
  id: string;
  name: string;
  monthlyCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOperationalCostDto {
  name: string;
  monthlyCost: number;
}

export interface UpdateOperationalCostDto {
  name?: string;
  monthlyCost?: number;
}

class OperationalCostsServiceClass extends BaseService {
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getAuthToken();
    const response = await fetch(`${apiUrl}/api/operational-costs${path}`, {
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

  async findAll(): Promise<OperationalCost[]> {
    return this.request<OperationalCost[]>('');
  }

  async create(dto: CreateOperationalCostDto): Promise<OperationalCost> {
    return this.request<OperationalCost>('', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async update(id: string, dto: UpdateOperationalCostDto): Promise<OperationalCost> {
    return this.request<OperationalCost>(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  }

  async remove(id: string): Promise<void> {
    await this.request(`/${id}`, {
      method: 'DELETE',
    });
  }
}

export const operationalCostsService = new OperationalCostsServiceClass();
