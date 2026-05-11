import { AxiosError } from 'axios';

export class ApiError extends Error {
  public status?: number;
  public data?: any;

  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    // Maintain correct prototype chain for subclassing built-ins
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data;
    // Assuming backend returns { message: '...' } in data
    const message = data?.message || error.message || 'حدث خطأ في الاتصال بالخادم';
    return new ApiError(message, status, data);
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  // Fallback for ad-hoc throws (if any missed)
  const fallback = error as any;
  const status = fallback?.response?.status;
  const data = fallback?.response?.data;
  const message = data?.message || fallback?.message || 'حدث خطأ غير متوقع';
  return new ApiError(message, status, data);
}
