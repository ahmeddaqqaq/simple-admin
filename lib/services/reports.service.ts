import { BaseService } from './base-service';

export interface IngredientUsage {
  id: string;
  name: string;
  categoryName: string;
  totalGrams: number;
  totalServings: number;
  baseServing: number;
  orderCount: number;
}

export interface ReadyItemSales {
  id: string;
  name: string;
  type: string;
  quantity: number;
  revenue: number;
}

export interface HourlyData {
  hour: number;
  orderCount: number;
  revenue: number;
}

export interface SalesReportData {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalSales: number;
    subtotal: number;
    deliveryFees: number;
    promoDiscounts: number;
    quantityDiscounts: number;
    pointsUsedValue: number;
    averageOrderValue: number;
  };
  paymentMethods: {
    method: string;
    count: number;
    total: number;
  }[];
  ordersByStatus: {
    status: string;
    count: number;
    total: number;
  }[];
  ingredients: IngredientUsage[];
  readyItems: ReadyItemSales[];
  hourlyDistribution: HourlyData[];
}

export interface IngredientCost {
  id: string;
  name: string;
  categoryName: string;
  totalGrams: number;
  costPerGram: number;
  totalCost: number;
}

export interface ReadyItemCost {
  id: string;
  name: string;
  type: string;
  quantity: number;
  costPrice: number;
  totalCost: number;
}

export interface CostReportData {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalIngredientsCost: number;
    totalReadyItemsCost: number;
    totalCost: number;
    totalRevenue: number;
    grossProfit: number;
    profitMargin: number;
  };
  ingredients: IngredientCost[];
  readyItems: ReadyItemCost[];
}

export class ReportsService extends BaseService {
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

  async getSalesReport(startDate: Date, endDate: Date): Promise<SalesReportData> {
    const queryParams = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    const response = await fetch(
      `${this.getApiUrl()}/api/admin/reports/sales?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch sales report');
    }

    return response.json();
  }

  async getCostReport(startDate: Date, endDate: Date): Promise<CostReportData> {
    const queryParams = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    const response = await fetch(
      `${this.getApiUrl()}/api/admin/reports/cost?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch cost report');
    }

    return response.json();
  }
}

export const reportsService = new ReportsService();
