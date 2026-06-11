import { describe, it, expect } from 'vitest';
import { AxiosError } from 'axios';
import { ApiError, handleApiError } from './errors';

describe('ApiError class', () => {
  it('should instantiate with message, status, and data', () => {
    const errorData = { detail: 'Invalid ID' };
    const apiError = new ApiError('Not Found', 404, errorData);

    expect(apiError).toBeInstanceOf(Error);
    expect(apiError).toBeInstanceOf(ApiError);
    expect(apiError.name).toBe('ApiError');
    expect(apiError.message).toBe('Not Found');
    expect(apiError.status).toBe(404);
    expect(apiError.data).toBe(errorData);
  });

  it('should maintain the correct prototype chain', () => {
    const apiError = new ApiError('Test Error');
    expect(Object.getPrototypeOf(apiError)).toBe(ApiError.prototype);
  });
});

describe('handleApiError function', () => {
  it('should return the error itself if it is already an ApiError', () => {
    const originalError = new ApiError('Custom API Error', 400);
    const result = handleApiError(originalError);
    expect(result).toBe(originalError);
  });

  it('should parse a standard AxiosError and extract message', () => {
    const config = { url: '/test' } as any;
    const axiosError = new AxiosError('Network Error', 'ERR_BAD_REQUEST', config);
    axiosError.response = {
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config,
      data: { message: 'برجاء التحقق من البيانات المرسلة' },
    };

    const result = handleApiError(axiosError);
    expect(result).toBeInstanceOf(ApiError);
    expect(result.status).toBe(400);
    expect(result.message).toBe('برجاء التحقق من البيانات المرسلة');
  });

  it('should fall back to title when message is absent in AxiosError response', () => {
    const config = { url: '/test' } as any;
    const axiosError = new AxiosError('Network Error', 'ERR_BAD_REQUEST', config);
    axiosError.response = {
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config,
      data: { title: 'العنصر غير موجود' },
    };

    const result = handleApiError(axiosError);
    expect(result.message).toBe('العنصر غير موجود');
  });

  it('should extract validation errors from ASP.NET errors object in AxiosError', () => {
    const config = { url: '/test' } as any;
    const axiosError = new AxiosError('Validation Failed', 'ERR_BAD_REQUEST', config);
    axiosError.response = {
      status: 422,
      statusText: 'Unprocessable Entity',
      headers: {},
      config,
      data: {
        title: 'One or more validation errors occurred.',
        errors: {
          email: ['البريد الإلكتروني غير صالح'],
          phone: ['رقم الهاتف يجب أن يتكون من 11 رقمًا', 'رقم الهاتف غير مسجل'],
        },
      },
    };

    const result = handleApiError(axiosError);
    expect(result.message).toContain('One or more validation errors occurred.');
    expect(result.message).toContain('email: البريد الإلكتروني غير صالح');
    expect(result.message).toContain('phone: رقم الهاتف يجب أن يتكون من 11 رقمًا, رقم الهاتف غير مسجل');
  });

  it('should fallback to error.message if no response data is present in AxiosError', () => {
    const config = { url: '/test' } as any;
    const axiosError = new AxiosError('Connection Timeout', 'ECONNABORTED', config);

    const result = handleApiError(axiosError);
    expect(result.message).toBe('تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.');
  });

  it('should use default Arabic network error message when no error message or data title is present', () => {
    const config = { url: '/test' } as any;
    const axiosError = new AxiosError(undefined, undefined, config);

    const result = handleApiError(axiosError);
    expect(result.message).toBe('حدث خطأ في الاتصال بالخادم');
  });

  it('should wrap a standard Error in an ApiError', () => {
    const nativeError = new Error('Something went wrong natively');
    const result = handleApiError(nativeError);

    expect(result).toBeInstanceOf(ApiError);
    expect(result.message).toBe('Something went wrong natively');
    expect(result.status).toBeUndefined();
  });

  it('should handle fallback for ad-hoc thrown objects', () => {
    const adhocError = {
      message: 'Ad-hoc error message',
      response: {
        status: 500,
        data: { message: 'Arabic adhoc error' },
      },
    };
    const result = handleApiError(adhocError);

    expect(result).toBeInstanceOf(ApiError);
    expect(result.status).toBe(500);
    expect(result.message).toBe('Arabic adhoc error');
  });

  it('should fallback to default unexpected Arabic error for primitive ad-hoc throws', () => {
    const result = handleApiError('random-string-throw');

    expect(result).toBeInstanceOf(ApiError);
    expect(result.message).toBe('حدث خطأ غير متوقع');
  });
});
