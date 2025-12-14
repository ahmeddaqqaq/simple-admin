export interface ApiResponse<T> {
  data: T;
  status: number;
}

export interface ApiListResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  error?: string;
  details?: unknown;
}
