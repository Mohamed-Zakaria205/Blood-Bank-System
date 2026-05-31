import { vi, describe, it, expect, beforeEach } from 'vitest';

// Use vi.hoisted to define variables that will be used inside vi.mock
const { mockPost, mockGet } = vi.hoisted(() => {
  return {
    mockPost: vi.fn(),
    mockGet: vi.fn(),
  };
});

vi.mock('axios', () => {
  const instance = {
    get: mockGet,
    post: mockPost,
    create: vi.fn().mockReturnThis(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  };
  return {
    default: {
      create: vi.fn(() => instance),
      post: mockPost,
      get: mockGet,
      isCancel: vi.fn(),
    },
  };
});

// Now import the API functions
import { loginApi, getMeApi, refreshTokenApi, logoutApi, changePasswordApi } from './auth';
import { ApiError } from './errors';

describe('Auth API Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loginApi', () => {
    it('should successfully login and return user details', async () => {
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com', role: 'doctor' };
      mockPost.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Success',
          data: mockUser,
          errors: null,
        },
      });

      const credentials = { email: 'test@example.com', password: 'password123' };
      const result = await loginApi(credentials);

      expect(mockPost).toHaveBeenCalledWith('/Auth/login', credentials, {
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should translate backend invalid credentials error to Arabic', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          success: false,
          message: 'Invalid credentials.',
          data: null,
          errors: null,
        },
      });

      await expect(loginApi({ email: 'test@example.com', password: 'wrong' }))
        .rejects
        .toThrow('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    });

    it('should translate account disabled error to Arabic', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          success: false,
          message: 'Account is disabled.',
          data: null,
          errors: null,
        },
      });

      await expect(loginApi({ email: 'disabled@example.com', password: 'password123' }))
        .rejects
        .toThrow('هذا الحساب معطل. يرجى التواصل مع المدير');
    });

    it('should handle Axios exceptions and wrap in ApiError with proper Arabic message', async () => {
      const axiosError = {
        response: {
          status: 401,
          data: {
            message: 'Invalid credentials.',
          },
        },
      };
      mockPost.mockRejectedValueOnce(axiosError);

      await expect(loginApi({ email: 'test@example.com', password: 'wrong' }))
        .rejects
        .toThrow('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    });
  });

  describe('getMeApi', () => {
    it('should return user profile on success', async () => {
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com', role: 'admin' };
      mockGet.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Success',
          data: mockUser,
        },
      });

      const result = await getMeApi();
      expect(mockGet).toHaveBeenCalledWith('/Auth/me');
      expect(result).toEqual(mockUser);
    });

    it('should throw ApiError when success is false', async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          success: false,
          message: 'Session expired',
        },
      });

      await expect(getMeApi()).rejects.toThrow('Session expired');
    });
  });

  describe('refreshTokenApi', () => {
    it('should call refresh endpoint and succeed', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Token refreshed',
        },
      });

      await expect(refreshTokenApi()).resolves.toBeUndefined();
      expect(mockPost).toHaveBeenCalledWith('/Auth/refresh', {});
    });

    it('should throw ApiError when refresh fails', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          success: false,
          message: 'Refresh failed',
        },
      });

      await expect(refreshTokenApi()).rejects.toThrow('Refresh failed');
    });
  });

  describe('logoutApi', () => {
    it('should attempt post to logout and swallow errors', async () => {
      mockPost.mockRejectedValueOnce(new Error('Network error'));

      // Should not throw
      await expect(logoutApi()).resolves.toBeUndefined();
      expect(mockPost).toHaveBeenCalledWith('/Auth/logout', {});
    });
  });

  describe('changePasswordApi', () => {
    it('should call change-password via apiClient', async () => {
      mockPost.mockResolvedValueOnce({ data: { success: true } });

      const payload = { currentPassword: 'old', newPassword: 'new' };
      await expect(changePasswordApi('user123', payload)).resolves.toBeUndefined();
      expect(mockPost).toHaveBeenCalledWith('/Auth/change-password', payload);
    });
  });
});
