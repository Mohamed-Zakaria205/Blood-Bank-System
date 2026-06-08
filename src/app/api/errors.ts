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
    
    // Extract message safely to avoid [object Object] or raw HTML
    let message = error.message || 'حدث خطأ في الاتصال بالخادم';
    if (typeof data === 'string') {
      // Use string data as message only if it doesn't look like HTML
      if (!data.trim().startsWith('<')) {
        message = data;
      }
    } else if (data && typeof data === 'object') {
      if (typeof data.message === 'string' && data.message.trim()) {
        message = data.message;
      } else if (typeof data.title === 'string' && data.title.trim()) {
        message = data.title;
      }
    }
    
    // Extract validation errors if they exist (ASP.NET Core format or custom wrapper)
    const validationErrors = data?.errors;
    if (validationErrors && typeof validationErrors === 'object' && Object.keys(validationErrors).length > 0) {
      const errorDetails = Object.entries(validationErrors)
        .map(([field, errs]) => {
          const errList = Array.isArray(errs) ? errs.join(', ') : errs;
          return `${field}: ${errList}`;
        })
        .join(' | ');
      message = `${message} - ${errorDetails}`;
    }

    return new ApiError(message, status, data);
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  // Fallback for ad-hoc throws (if any missed)
  const fallback = error as any;
  const status = fallback?.response?.status;
  const data = fallback?.response?.data;
  const message = (data && typeof data === 'object' && typeof data.message === 'string') 
    ? data.message 
    : (typeof fallback?.message === 'string' ? fallback.message : 'حدث خطأ غير متوقع');
  return new ApiError(message, status, data);
}
