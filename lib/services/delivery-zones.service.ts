import { BaseService } from './base-service';
import { getAuthToken } from '@/lib/apiConfig';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.simple-jo.com';

// DeliveryZone interface
export interface DeliveryZone {
  id: string;
  name: string;
  centerLatitude: number;
  centerLongitude: number;
  radiusKm: number;
  fee: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeliveryZoneDto {
  name: string;
  centerLatitude: number;
  centerLongitude: number;
  radiusKm: number;
  fee: number;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateDeliveryZoneDto {
  name?: string;
  centerLatitude?: number;
  centerLongitude?: number;
  radiusKm?: number;
  fee?: number;
  sortOrder?: number;
  isActive?: boolean;
}

export interface DeliveryFeeResponse {
  available: boolean;
  fee: number | null;
  zoneName: string | null;
  message: string;
}

class DeliveryZonesServiceClass extends BaseService {
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getAuthToken();
    const response = await fetch(`${apiUrl}/api/delivery-zones${path}`, {
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

  async findAll(includeInactive?: boolean): Promise<DeliveryZone[]> {
    const params = includeInactive ? '?includeInactive=true' : '';
    return this.request<DeliveryZone[]>(`${params}`);
  }

  async findOne(id: string): Promise<DeliveryZone> {
    return this.request<DeliveryZone>(`/${id}`);
  }

  async create(dto: CreateDeliveryZoneDto): Promise<DeliveryZone> {
    return this.request<DeliveryZone>('', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async update(id: string, dto: UpdateDeliveryZoneDto): Promise<DeliveryZone> {
    return this.request<DeliveryZone>(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  }

  async remove(id: string): Promise<void> {
    await this.request(`/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleActive(id: string): Promise<DeliveryZone> {
    return this.request<DeliveryZone>(`/${id}/toggle-active`, {
      method: 'PATCH',
    });
  }

  async calculateFee(latitude: number, longitude: number): Promise<DeliveryFeeResponse> {
    return this.request<DeliveryFeeResponse>(
      `/calculate?latitude=${latitude}&longitude=${longitude}`
    );
  }
}

export const deliveryZonesService = new DeliveryZonesServiceClass();
