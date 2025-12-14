import { toast } from 'sonner';
import {
  AppError,
  NetworkError,
  UnauthorizedError,
  ValidationError,
} from '@/lib/types/api/errors';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  onUnauthorized?: () => void;
  customMessage?: string;
}

export function handleError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): string {
  const { showToast = true, onUnauthorized, customMessage } = options;

  let message = customMessage || 'An error occurred';
  let description: string | undefined;

  if (error instanceof UnauthorizedError) {
    message = 'Session expired';
    description = 'Please log in again';

    if (showToast) {
      toast.error(message, { description });
    }

    onUnauthorized?.();
    return message;
  }

  if (error instanceof ValidationError) {
    message = error.message;

    if (error.fields) {
      const fieldErrors = Object.entries(error.fields)
        .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
        .join('\n');
      description = fieldErrors;
    }

    if (showToast) {
      toast.error(message, { description });
    }
    return message;
  }

  if (error instanceof NetworkError) {
    message = 'Network error';
    description = 'Please check your internet connection';

    if (showToast) {
      toast.error(message, { description });
    }
    return message;
  }

  if (error instanceof AppError) {
    message = error.message;

    if (showToast) {
      toast.error(message);
    }
    return message;
  }

  // Unknown error
  console.error('Unknown error:', error);

  if (showToast) {
    toast.error('An unexpected error occurred');
  }

  return message;
}

export function showSuccess(message: string, description?: string) {
  toast.success(message, { description });
}

export function showInfo(message: string, description?: string) {
  toast.info(message, { description });
}

export function showWarning(message: string, description?: string) {
  toast.warning(message, { description });
}
