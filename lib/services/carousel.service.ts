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
  image: File;
  route: string;
  displayOrder?: number;
}

export interface UpdateCarouselSlideDto {
  image?: File;
  route?: string;
  displayOrder?: number;
  isActive?: boolean;
}

class CarouselService {
  private getApiUrl() {
    return process.env.NEXT_PUBLIC_API_URL || 'https://api.simple-jo.com';
  }

  private getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async findAll(): Promise<CarouselSlide[]> {
    const response = await fetch(`${this.getApiUrl()}/api/admin/carousel`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch carousel slides');
    }

    return response.json();
  }

  async create(data: CreateCarouselSlideDto): Promise<CarouselSlide> {
    const formData = new FormData();
    formData.append('image', data.image);
    formData.append('route', data.route);
    if (data.displayOrder !== undefined) formData.append('displayOrder', String(data.displayOrder));

    const response = await fetch(`${this.getApiUrl()}/api/admin/carousel`, {
      method: 'POST',
      headers: { ...this.getAuthHeaders() },
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to create carousel slide');
    }

    return response.json();
  }

  async update(id: string, data: UpdateCarouselSlideDto): Promise<CarouselSlide> {
    const formData = new FormData();
    if (data.image) formData.append('image', data.image);
    if (data.route !== undefined) formData.append('route', data.route);
    if (data.displayOrder !== undefined) formData.append('displayOrder', String(data.displayOrder));
    if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));

    const response = await fetch(`${this.getApiUrl()}/api/admin/carousel/${id}`, {
      method: 'PUT',
      headers: { ...this.getAuthHeaders() },
      credentials: 'include',
      body: formData,
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
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() } as Record<string, string>,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to delete carousel slide');
    }
  }
}

export const carouselService = new CarouselService();
