export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NetworkError extends AppError {
  constructor(message = 'Network connection failed') {
    super(message, 0);
    this.name = 'NetworkError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ValidationError extends AppError {
  constructor(
    message = 'Validation failed',
    public fields?: Record<string, string[]>
  ) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}
