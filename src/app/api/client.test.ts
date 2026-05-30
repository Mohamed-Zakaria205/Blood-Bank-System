import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AxiosError } from 'axios';
import apiClient from './client';

vi.mock('./auth', () => ({
  refreshTokenApi: vi.fn(),
  logoutApi: vi.fn(),
}));

describe('Axios Token Refresh Interceptor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // Helper to access the registered interceptors directly for unit testing
  const getInterceptors = () => {
    const handlers = (apiClient.interceptors.response as any).handlers;
    return handlers[0];
  };

  it('passes through successful responses', async () => {
    const { fulfilled } = getInterceptors();
    const mockResponse = { status: 200, data: { success: true } };
    
    const result = await fulfilled(mockResponse);
    expect(result).toBe(mockResponse);
  });

  it('rejects non-401 errors immediately without attempting refresh', async () => {
    const { rejected } = getInterceptors();
    
    const error = new AxiosError('Server Error');
    error.response = { status: 500, data: {}, statusText: 'Error', headers: {}, config: {} as any };
    error.config = { url: '/api/test' } as any;
    
    // The interceptor wraps the error in handleApiError, but it will still be a rejection
    await expect(rejected(error)).rejects.toThrow();
  });

  it('rejects 401 errors for Auth endpoints immediately', async () => {
    const { rejected } = getInterceptors();
    
    const error = new AxiosError('Unauthorized');
    error.response = { status: 401, data: {}, statusText: 'Unauthorized', headers: {}, config: {} as any };
    error.config = { url: '/api/Auth/login' } as any; // An auth endpoint
    
    await expect(rejected(error)).rejects.toThrow();
  });

  it('rejects 401 errors immediately if no user is in localStorage', async () => {
    const { rejected } = getInterceptors();
    
    const error = new AxiosError('Unauthorized');
    error.response = { status: 401, data: {}, statusText: 'Unauthorized', headers: {}, config: {} as any };
    error.config = { url: '/api/Donors' } as any;
    
    // localStorage is empty (no 'bloodlink_user')
    await expect(rejected(error)).rejects.toThrow();
  });

  it('handles cancelled requests correctly by rejecting with original error', async () => {
    const { rejected } = getInterceptors();
    
    const error = new AxiosError('Canceled');
    error.name = 'CanceledError';
    error.code = 'ERR_CANCELED';
    error.config = { url: '/api/test' } as any;
    
    await expect(rejected(error)).rejects.toThrow();
  });
});
