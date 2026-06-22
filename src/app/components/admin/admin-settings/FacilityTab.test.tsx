import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import FacilityTab from './FacilityTab';
import { toast } from 'sonner';

// Setup hoisted mocks
const { mockUseMainBranchSettings, mockUseUpdateMainBranchSettings } = vi.hoisted(
  () => {
    return {
      mockUseMainBranchSettings: vi.fn(),
      mockUseUpdateMainBranchSettings: vi.fn(),
    };
  },
);

vi.mock('../../../hooks/useMainBranchSettings', () => ({
  useMainBranchSettings: mockUseMainBranchSettings,
  useUpdateMainBranchSettings: mockUseUpdateMainBranchSettings,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('FacilityTab Component', () => {
  const sampleSettings = {
    id: 'main-branch-id',
    name: 'مستشفى بني سويف العام',
    location: 'بني سويف',
    addressDetails: 'شارع الرياض، بجوار مركز البريد',
    phoneNumber: '082-2320000',
    email: 'info@bsgh.gov.eg',
    supportedDonationTypes: ['WholeBlood', 'Platelets'],
    slotDurationMinutes: 15,
    maxDonorsPerSlot: 10,
    weeklyHours: [
      { dayOfWeek: 0, isClosed: false, openingTime: '08:00', closingTime: '16:00', maxDonorsPerSlot: null },
      { dayOfWeek: 1, isClosed: false, openingTime: '08:00', closingTime: '16:00', maxDonorsPerSlot: null },
      { dayOfWeek: 2, isClosed: false, openingTime: '08:00', closingTime: '16:00', maxDonorsPerSlot: null },
      { dayOfWeek: 3, isClosed: false, openingTime: '08:00', closingTime: '16:00', maxDonorsPerSlot: null },
      { dayOfWeek: 4, isClosed: false, openingTime: '08:00', closingTime: '16:00', maxDonorsPerSlot: null },
      { dayOfWeek: 5, isClosed: true, openingTime: '00:00', closingTime: '00:00', maxDonorsPerSlot: null },
      { dayOfWeek: 6, isClosed: true, openingTime: '00:00', closingTime: '00:00', maxDonorsPerSlot: null },
    ],
    exclusions: [
      { id: 'ex-1', date: '2026-06-25', isClosed: true, specialOpeningTime: null, specialClosingTime: null, reason: 'إجازة عيد الأضحى' },
    ],
  };

  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseMainBranchSettings.mockReturnValue({
      data: sampleSettings,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    mockUseUpdateMainBranchSettings.mockReturnValue({
      mutate: mockMutate.mockImplementation((_payload, options) => {
        if (options && options.onSuccess) {
          options.onSuccess();
        }
      }),
      isPending: false,
    });
  });

  it('renders loading state', () => {
    mockUseMainBranchSettings.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });

    render(<FacilityTab />);
    expect(screen.getByText('جاري تحميل إعدادات الفرع الرئيسي...')).toBeInTheDocument();
  });

  it('renders error state and allows retry', () => {
    const mockRefetch = vi.fn();
    mockUseMainBranchSettings.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    });

    render(<FacilityTab />);
    expect(screen.getByText('تعذر تحميل إعدادات الفرع الرئيسي. يرجى التحقق من اتصال الشبكة.')).toBeInTheDocument();

    const retryBtn = screen.getByText('إعادة المحاولة');
    fireEvent.click(retryBtn);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('renders subtabs and populates settings values', () => {
    render(<FacilityTab />);

    expect(screen.getByText('اسم الفرع')).toBeInTheDocument();
    expect(screen.getByDisplayValue('مستشفى بني سويف العام')).toBeInTheDocument();
    expect(screen.getByDisplayValue('بني سويف')).toBeInTheDocument();
    expect(screen.getByDisplayValue('082-2320000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('info@bsgh.gov.eg')).toBeInTheDocument();

    // Check donation type checkboxes
    const wholeBloodCheckbox = screen.getByLabelText('كامل الدم (Whole Blood)');
    expect(wholeBloodCheckbox).toBeChecked();
  });

  it('navigates subtabs', () => {
    render(<FacilityTab />);

    // Navigate to Weekly Hours
    const weeklyTabButton = screen.getByText('ساعات العمل الأسبوعية');
    fireEvent.click(weeklyTabButton);

    expect(screen.getByText('الأحد')).toBeInTheDocument();
    expect(screen.getByText('السبت')).toBeInTheDocument();

    // Navigate to Holidays & Exceptions
    const exclusionsTabButton = screen.getByText('أيام الإجازات والاستثناءات');
    fireEvent.click(exclusionsTabButton);

    expect(screen.getByText('إجازة عيد الأضحى')).toBeInTheDocument();
  });

  it('submits updated settings without read-only fields', async () => {
    render(<FacilityTab />);

    const nameInput = screen.getByDisplayValue('مستشفى بني سويف العام');
    fireEvent.change(nameInput, { target: { value: 'مستشفى بني سويف الجديد' } });

    const saveButton = screen.getByText('حفظ التغييرات');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'مستشفى بني سويف الجديد',
        }),
        expect.any(Object),
      );
      // Ensure phoneNumber and email are excluded from Update Request payload
      const payload = mockMutate.mock.calls[0][0];
      expect(payload.phoneNumber).toBeUndefined();
      expect(payload.email).toBeUndefined();
    });

    expect(toast.success).toHaveBeenCalledWith('تم حفظ إعدادات الفرع الرئيسي بنجاح');
  });

  it('triggers form validation on name empty', () => {
    render(<FacilityTab />);

    const nameInput = screen.getByDisplayValue('مستشفى بني سويف العام');
    fireEvent.change(nameInput, { target: { value: '' } });

    const saveButton = screen.getByText('حفظ التغييرات');
    fireEvent.click(saveButton);

    expect(toast.error).toHaveBeenCalledWith('اسم الفرع مطلوب');
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
