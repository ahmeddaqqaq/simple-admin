import { ApiError } from '@/lib/api';
import {
  AppError,
  NetworkError,
  UnauthorizedError,
  ValidationError,
} from '@/lib/types/api/errors';
import '@/lib/apiConfig'; // Ensure API is configured before any requests

export class BaseService {
  protected async handleRequest<T>(request: Promise<any>): Promise<T> {
    try {
      const response = await request;
      return response as T;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  protected handleError(error: unknown): AppError {
    if (error instanceof ApiError) {
      // Map API errors to app errors
      if (error.status === 401) {
        return new UnauthorizedError(
          error.body?.message || 'Authentication required'
        );
      }

      if (error.status === 400) {
        return new ValidationError(
          error.body?.message || 'Validation failed',
          error.body?.fields
        );
      }

      if (error.status === 0 || !error.status) {
        return new NetworkError();
      }

      return new AppError(
        error.body?.message || error.statusText || 'An error occurred',
        error.status,
        error
      );
    }

    if (error instanceof Error) {
      return new AppError(error.message, 500, error);
    }

    return new AppError('An unexpected error occurred', 500, error);
  }
}
