export interface CustomerTier {
  id: string;
  name: string;
  color: string | null;
  minMonthlySpend: number;
  discountPercentage: number | null;
  description: string | null;
  displayOrder: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerTierDto {
  name: string;
  color?: string;
  minMonthlySpend: number;
  discountPercentage?: number;
  description?: string;
  displayOrder?: number;
}

export interface UpdateCustomerTierDto {
  name?: string;
  color?: string;
  minMonthlySpend?: number;
  discountPercentage?: number;
  description?: string;
  displayOrder?: number;
}

class CustomerTiersService {
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

  async findAll(): Promise<CustomerTier[]> {
    const response = await fetch(`${this.getApiUrl()}/api/admin/customer-tiers`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch customer tiers');
    }

    return response.json();
  }

  async create(data: CreateCustomerTierDto): Promise<CustomerTier> {
    const response = await fetch(`${this.getApiUrl()}/api/admin/customer-tiers`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to create customer tier');
    }

    return response.json();
  }

  async update(id: string, data: UpdateCustomerTierDto): Promise<CustomerTier> {
    const response = await fetch(`${this.getApiUrl()}/api/admin/customer-tiers/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to update customer tier');
    }

    return response.json();
  }

  async remove(id: string): Promise<void> {
    const response = await fetch(`${this.getApiUrl()}/api/admin/customer-tiers/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to delete customer tier');
    }
  }
}

export const customerTiersService = new CustomerTiersService();
