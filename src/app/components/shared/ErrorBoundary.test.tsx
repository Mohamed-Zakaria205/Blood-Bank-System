import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

// Mock react-router hooks and functions
const { mockUseRouteError, mockUseNavigate, mockIsRouteErrorResponse } = vi.hoisted(() => ({
  mockUseRouteError: vi.fn(),
  mockUseNavigate: vi.fn(),
  mockIsRouteErrorResponse: vi.fn(),
}));

vi.mock('react-router', () => ({
  useRouteError: mockUseRouteError,
  useNavigate: () => mockUseNavigate,
  isRouteErrorResponse: mockIsRouteErrorResponse,
}));

describe('ErrorBoundary Component', () => {
  const originalLocation = window.location;
  const mockReload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window.location reload safely
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        reload: mockReload,
      },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      configurable: true,
      writable: true,
    });
  });

  it('should render HTTP status code and message when route error is a RouteErrorResponse', () => {
    mockIsRouteErrorResponse.mockReturnValue(true);
    mockUseRouteError.mockReturnValue({
      status: 404,
      statusText: 'Not Found',
    });

    const { container } = render(<ErrorBoundary />);

    expect(screen.getByText('خطأ 404: Not Found')).toBeInTheDocument();
    expect(
      screen.getByText('الصفحة التي تحاول الوصول إليها غير موجودة أو حدث خطأ في الخادم.'),
    ).toBeInTheDocument();

    // Assert RTL and Tajawal font styles
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv).toHaveAttribute('dir', 'rtl');
    expect(outerDiv.style.fontFamily).toContain('Tajawal');
  });

  it('should render error message when error is an instance of native Error', () => {
    mockIsRouteErrorResponse.mockReturnValue(false);
    mockUseRouteError.mockReturnValue(new Error('خطأ في استيراد البيانات'));

    render(<ErrorBoundary />);

    expect(screen.getByText('عذراً، حدث خطأ غير متوقع')).toBeInTheDocument();
    expect(screen.getByText('خطأ في استيراد البيانات')).toBeInTheDocument();
  });

  it('should render default fallback message for arbitrary error objects', () => {
    mockIsRouteErrorResponse.mockReturnValue(false);
    mockUseRouteError.mockReturnValue('some strange string error');

    render(<ErrorBoundary />);

    expect(screen.getByText('عذراً، حدث خطأ غير متوقع')).toBeInTheDocument();
    expect(
      screen.getByText('نواجه مشكلة فنية حالياً. يرجى تحديث الصفحة أو العودة للرئيسية.'),
    ).toBeInTheDocument();
  });

  it('should reload the page when clicking "تحديث الصفحة" button', () => {
    mockIsRouteErrorResponse.mockReturnValue(false);
    mockUseRouteError.mockReturnValue(new Error('API Failure'));

    render(<ErrorBoundary />);

    const reloadButton = screen.getByRole('button', { name: /تحديث الصفحة/i });
    fireEvent.click(reloadButton);

    expect(mockReload).toHaveBeenCalledTimes(1);
  });

  it('should navigate to home page when clicking "العودة للرئيسية" button', () => {
    mockIsRouteErrorResponse.mockReturnValue(false);
    mockUseRouteError.mockReturnValue(new Error('API Failure'));

    render(<ErrorBoundary />);

    const homeButton = screen.getByRole('button', { name: /العودة للرئيسية/i });
    fireEvent.click(homeButton);

    expect(mockUseNavigate).toHaveBeenCalledWith('/', { replace: true });
  });
});
