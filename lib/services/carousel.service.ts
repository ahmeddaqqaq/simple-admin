export interface CarouselSlide {
  id: string;
  imageUrl: string;
  route: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCarouselSlideDto {
  imageUrl: string;
  route: string;
  displayOrder?: number;
}

export interface UpdateCarouselSlideDto {
  imageUrl?: string;
  route?: string;
  displayOrder?: number;
  isActive?: boolean;
}

class CarouselService {
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

  async findAll(): Promise<CarouselSlide[]> {
    const response = await fetch(`${this.getApiUrl()}/api/admin/carousel`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch carousel slides');
    }

    return response.json();
  }

  async create(data: CreateCarouselSlideDto): Promise<CarouselSlide> {
    const response = await fetch(`${this.getApiUrl()}/api/admin/carousel`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to create carousel slide');
    }

    return response.json();
  }

  async update(id: string, data: UpdateCarouselSlideDto): Promise<CarouselSlide> {
    const response = await fetch(`${this.getApiUrl()}/api/admin/carousel/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to update carousel slide');
    }

    return response.json();
  }

  async remove(id: string): Promise<void> {
    const response = await fetch(`${this.getApiUrl()}/api/admin/carousel/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to delete carousel slide');
    }
  }
}

export const carouselService = new CarouselService();
