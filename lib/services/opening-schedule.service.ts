export interface OpeningScheduleDay {
  id: string;
  dayOfWeek: number;
  dayName: string;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export interface UpdateScheduleDto {
  days: {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isOpen: boolean;
  }[];
}

class OpeningScheduleService {
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

  async getSchedule(): Promise<OpeningScheduleDay[]> {
    const response = await fetch(`${this.getApiUrl()}/api/admin/opening-schedule`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch opening schedule');
    }

    return response.json();
  }

  async updateSchedule(data: UpdateScheduleDto): Promise<OpeningScheduleDay[]> {
    const response = await fetch(`${this.getApiUrl()}/api/admin/opening-schedule`, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to update opening schedule');
    }

    return response.json();
  }
}

export const openingScheduleService = new OpeningScheduleService();
