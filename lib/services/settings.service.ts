import { BaseService } from './base-service';

export interface AppSettings {
  id: string;
  isOpen: boolean;
  mealBoxCost: number;
  saladBoxCost: number;
  detoxBottleCost: number;
  woodCutleryCost: number;
  plasticCutleryCost: number;
  updatedAt: string;
}

export interface UpdateSettingsDto {
  isOpen?: boolean;
  mealBoxCost?: number;
  saladBoxCost?: number;
  detoxBottleCost?: number;
  woodCutleryCost?: number;
  plasticCutleryCost?: number;
}

export class SettingsService extends BaseService {
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

  async getSettings(): Promise<AppSettings> {
    const response = await fetch(
      `${this.getApiUrl()}/api/settings`,
      {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch settings');
    }

    return response.json();
  }

  async updateSettings(data: UpdateSettingsDto): Promise<AppSettings> {
    const response = await fetch(
      `${this.getApiUrl()}/api/settings`,
      {
        method: 'PATCH',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to update settings');
    }

    return response.json();
  }
}

export const settingsService = new SettingsService();
