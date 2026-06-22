import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import EligibilityTab from './EligibilityTab';
import { toast } from 'sonner';

// Setup hoisted mocks
const { mockUseEligibilitySettings, mockUseUpdateEligibilitySettings } = vi.hoisted(
  () => {
    return {
      mockUseEligibilitySettings: vi.fn(),
      mockUseUpdateEligibilitySettings: vi.fn(),
    };
  },
);

vi.mock('../../../hooks/useDonors', () => ({
  useEligibilitySettings: mockUseEligibilitySettings,
  useUpdateEligibilitySettings: mockUseUpdateEligibilitySettings,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('EligibilityTab Component', () => {
  const sampleSettings = {
    wholeBloodMaleDays: 90,
    wholeBloodFemaleDays: 120,
    plasmaDays: 28,
    plateletsDays: 7,
    defaultScreeningLockoutDays: 7,
  };

  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseEligibilitySettings.mockReturnValue({
      data: sampleSettings,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    mockUseUpdateEligibilitySettings.mockReturnValue({
      mutate: mockMutate.mockImplementation((_payload, options) => {
        if (options && options.onSuccess) {
          options.onSuccess({ message: 'Success' });
        }
      }),
      isPending: false,
    });
  });

  it('renders loading state', () => {
    mockUseEligibilitySettings.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });

    render(<EligibilityTab />);
    expect(screen.getByText('جاري تحميل إعدادات مؤهلية التبرع...')).toBeInTheDocument();
  });

  it('renders error state and allows retry', () => {
    const mockRefetch = vi.fn();
    mockUseEligibilitySettings.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    });

    render(<EligibilityTab />);
    expect(screen.getByText('تعذر تحميل إعدادات مؤهلية التبرع. يرجى التحقق من اتصال الخادم.')).toBeInTheDocument();

    const retryBtn = screen.getByText('إعادة المحاولة');
    fireEvent.click(retryBtn);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('renders inputs with loaded settings values', () => {
    render(<EligibilityTab />);

    expect(screen.getByText('فترة انتظار الذكور (أيام)')).toBeInTheDocument();
    expect(screen.getByDisplayValue('90')).toBeInTheDocument();
    expect(screen.getByDisplayValue('120')).toBeInTheDocument();
    expect(screen.getByDisplayValue('28')).toBeInTheDocument();
    expect(screen.getAllByDisplayValue('7').length).toBe(2);
  });

  it('submits updated settings successfully', async () => {
    render(<EligibilityTab />);

    const maleInput = screen.getByDisplayValue('90');
    fireEvent.change(maleInput, { target: { value: '95' } });

    const saveButton = screen.getByText('حفظ التغييرات');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          wholeBloodMaleDays: 95,
          wholeBloodFemaleDays: 120,
          plasmaDays: 28,
          plateletsDays: 7,
          defaultScreeningLockoutDays: 7,
        }),
        expect.any(Object),
      );
    });

    expect(toast.success).toHaveBeenCalledWith('تم حفظ التغييرات بنجاح');
  });

  it('triggers client-side validations', () => {
    render(<EligibilityTab />);

    const maleInput = screen.getByDisplayValue('90');
    fireEvent.change(maleInput, { target: { value: '0' } });

    const saveButton = screen.getByText('حفظ التغييرات');
    fireEvent.click(saveButton);

    expect(toast.error).toHaveBeenCalledWith('يرجى التحقق من صحة البيانات المدخلة');
    expect(screen.getByText('فترة انتظار الذكور يجب أن تكون أكبر من الصفر')).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('displays server-side validation errors', async () => {
    const serverErrors = {
      WholeBloodFemaleDays: ['Must be between 1 and 365 days.'],
    };

    mockUseUpdateEligibilitySettings.mockReturnValue({
      mutate: vi.fn().mockImplementation((_payload, options) => {
        if (options && options.onError) {
          options.onError({
            data: {
              errors: serverErrors,
            },
          });
        }
      }),
      isPending: false,
    });

    render(<EligibilityTab />);

    // Change value to trigger hasUnsavedChanges
    const maleInput = screen.getByDisplayValue('90');
    fireEvent.change(maleInput, { target: { value: '95' } });

    const saveButton = screen.getByText('حفظ التغييرات');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Must be between 1 and 365 days.')).toBeInTheDocument();
    });
  });
});
