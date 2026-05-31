import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import axios, { AxiosError } from 'axios';
import apiClient from './client';

// Mock the ./auth module so client.ts imports mocked functions
vi.mock('./auth', () => {
  return {
    refreshTokenApi: vi.fn(),
    logoutApi: vi.fn(),
  };
});

describe('Axios Client & Token Refresh Interceptor', () => {
  const mockAdapter = vi.fn();
  const mockHref = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Override the apiClient adapter to capture and mock requests
    apiClient.defaults.adapter = mockAdapter;

    // Mock window.location
    const location = {
      ...window.location,
    };
    Object.defineProperty(location, 'href', {
      set: mockHref,
      get: () => 'http://localhost/',
      configurable: true,
    });
    vi.spyOn(window, 'location', 'get').mockReturnValue(location as any);

    localStorage.clear();
  });

  afterEach(() => {
    // Reset global refresh state to clean up between runs
    const _global = globalThis as any;
    if (_global.__bloodlink_refresh_state__) {
      _global.__bloodlink_refresh_state__.isRefreshing = false;
      _global.__bloodlink_refresh_state__.failedQueue = [];
    }
  });

  function createAxiosError(status: number, message: string, config: any) {
    const error = new AxiosError(message, status.toString(), config);
    error.response = {
      status,
      statusText: message,
      headers: {},
      config,
      data: { message },
    };
    return error;
  }

  it('should pass through standard 200 OK responses', async () => {
    const responseData = { success: true, data: 'test-data' };
    mockAdapter.mockResolvedValueOnce({
      data: responseData,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const res = await apiClient.get('/some-endpoint');
    expect(res.data).toEqual(responseData);
  });

  it('should reject non-401 errors immediately without calling refresh', async () => {
    const config = { url: '/some-endpoint' };
    const mockError = createAxiosError(500, 'Internal Server Error', config);
    mockAdapter.mockRejectedValueOnce(mockError);

    const { refreshTokenApi } = await import('./auth');

    await expect(apiClient.get('/some-endpoint')).rejects.toThrow('Internal Server Error');
    expect(refreshTokenApi).not.toHaveBeenCalled();
  });

  it('should reject 401 errors on auth endpoints immediately', async () => {
    const config = { url: '/Auth/login' };
    const mockError = createAxiosError(401, 'Unauthorized', config);
    mockAdapter.mockRejectedValueOnce(mockError);

    const { refreshTokenApi } = await import('./auth');

    await expect(apiClient.post('/Auth/login', {})).rejects.toThrow('Unauthorized');
    expect(refreshTokenApi).not.toHaveBeenCalled();
  });

  it('should reject 401 errors immediately if no user session is in localStorage', async () => {
    localStorage.removeItem('bloodlink_user');

    const config = { url: '/some-endpoint' };
    const mockError = createAxiosError(401, 'Unauthorized', config);
    mockAdapter.mockRejectedValueOnce(mockError);

    const { refreshTokenApi } = await import('./auth');

    await expect(apiClient.get('/some-endpoint')).rejects.toThrow('Unauthorized');
    expect(refreshTokenApi).not.toHaveBeenCalled();
  });

  it('should perform token refresh on 401, queue concurrent requests, and retry all after success', async () => {
    localStorage.setItem('bloodlink_user', JSON.stringify({ id: '1', role: 'doctor' }));

    const { refreshTokenApi } = await import('./auth');
    (refreshTokenApi as any).mockResolvedValueOnce(undefined);

    // First request fails with 401, then succeeds on retry
    mockAdapter.mockRejectedValueOnce(createAxiosError(401, 'Unauthorized', { url: '/first' }));
    mockAdapter.mockResolvedValueOnce({
      data: { result: 'first-success' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { url: '/first' },
    });

    // Concurrent request succeeds on retry
    mockAdapter.mockResolvedValueOnce({
      data: { result: 'second-success' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { url: '/second' },
    });

    const firstPromise = apiClient.get('/first');

    // Wait a brief tick to allow the first request to fail and start refresh
    await new Promise((resolve) => setTimeout(resolve, 5));

    const secondPromise = apiClient.get('/second');

    const [firstRes, secondRes] = await Promise.all([firstPromise, secondPromise]);

    expect(refreshTokenApi).toHaveBeenCalledTimes(1);
    expect(firstRes.data).toEqual({ result: 'first-success' });
    expect(secondRes.data).toEqual({ result: 'second-success' });
  });

  it('should handle refresh failure by rejecting queued requests, clearing storage, and redirecting', async () => {
    localStorage.setItem('bloodlink_user', JSON.stringify({ id: '1', role: 'doctor' }));

    const { refreshTokenApi, logoutApi } = await import('./auth');
    (refreshTokenApi as any).mockRejectedValueOnce(new Error('Refresh Token Expired'));

    // First request fails with 401
    mockAdapter.mockRejectedValueOnce(createAxiosError(401, 'Unauthorized', { url: '/first' }));

    const firstPromise = apiClient.get('/first');
    // Silently catch immediately to avoid unhandled rejection warnings in node
    firstPromise.catch(() => {});

    // Wait a brief tick to allow the first request to fail and start refresh
    await new Promise((resolve) => setTimeout(resolve, 5));

    const secondPromise = apiClient.get('/second');
    // Silently catch immediately to avoid unhandled rejection warnings in node
    secondPromise.catch(() => {});

    await Promise.all([
      expect(firstPromise).rejects.toThrow(),
      expect(secondPromise).rejects.toThrow(),
    ]);

    expect(logoutApi).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('bloodlink_user')).toBeNull();
    expect(mockHref).toHaveBeenCalledWith('/login');
  });

  it('should bypass cancelled requests without triggering refresh', async () => {
    const config = { url: '/some-endpoint' };
    const mockError = createAxiosError(401, 'Cancelled', config);

    // Spy on axios.isCancel and force it to return true for this test
    const isCancelSpy = vi.spyOn(axios, 'isCancel').mockReturnValueOnce(true);

    mockAdapter.mockRejectedValueOnce(mockError);

    const { refreshTokenApi } = await import('./auth');

    await expect(apiClient.get('/some-endpoint')).rejects.toThrow();
    expect(refreshTokenApi).not.toHaveBeenCalled();

    isCancelSpy.mockRestore();
  });
});
