export interface StreakConfig {
  id: string;
  requiredDaysPerWeek: number;
  goldCoinReward: number;
  isActive: boolean;
}

export interface UpdateStreakConfigDto {
  requiredDaysPerWeek?: number;
  goldCoinReward?: number;
  isActive?: boolean;
}

class StreakService {
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

  async getConfig(): Promise<StreakConfig> {
    const response = await fetch(`${this.getApiUrl()}/api/admin/streak`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch streak config');
    }

    return response.json();
  }

  async updateConfig(data: UpdateStreakConfigDto): Promise<StreakConfig> {
    const response = await fetch(`${this.getApiUrl()}/api/admin/streak`, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to update streak config');
    }

    return response.json();
  }
}

export const streakService = new StreakService();
