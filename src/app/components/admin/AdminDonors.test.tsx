import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AdminDonors from './AdminDonors';
import { toast } from 'sonner';

// Setup hoisted mocks
const {
  mockUsePaginatedDonors,
  mockUseUpdateDonor,
  mockUseDonor,
  mockFetchDonorById,
} = vi.hoisted(() => {
  return {
    mockUsePaginatedDonors: vi.fn(),
    mockUseUpdateDonor: vi.fn(),
    mockUseDonor: vi.fn(),
    mockFetchDonorById: vi.fn(),
  };
});

// Mock hooks
vi.mock('../../hooks/useDonors', () => ({
  usePaginatedDonors: mockUsePaginatedDonors,
  useUpdateDonor: mockUseUpdateDonor,
  useDonor: mockUseDonor,
}));

// Mock API calls
vi.mock('../../api/donors', () => ({
  fetchDonorById: mockFetchDonorById,
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AdminDonors Component', () => {
  const sampleDonorsResponse = {
    data: [
      {
        id: 'donor-1',
        donorCode: 'D-1234',
        name: 'أحمد محمود علي',
        phone: '01011112222',
        nationalId: '29001012409876',
        bloodType: 'A+',
        governorate: 'بني سويف',
        district: 'بني سويف',
        area: 'المرماح',
        address: 'شارع المرماح الرئيسي',
        gender: 'male',
        dateOfBirth: '1990-01-01',
        age: 36,
        status: 'eligible',
        lastDonationDate: '2026-04-10',
        donations: 5,
        points: 120,
        hasAppAccount: true,
      },
      {
        id: 'donor-2',
        donorCode: '—',
        name: 'منى أحمد السيد',
        phone: '01233334444',
        nationalId: '29810102409876',
        bloodType: 'O-',
        governorate: 'القاهرة',
        district: 'مصر الجديدة',
        area: 'روكسي',
        address: 'شارع روكسي العام',
        gender: 'female',
        dateOfBirth: '1998-10-10',
        age: 27,
        status: 'ineligible',
        lastDonationDate: null,
        donations: 0,
        points: 0,
        hasAppAccount: false,
        rejectionReason: 'انخفاض نسبة الهيموجلوبين',
        deferredUntil: '2026-06-30',
      },
    ],
    total: 2,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUsePaginatedDonors.mockReturnValue({
      data: sampleDonorsResponse,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    mockUseUpdateDonor.mockReturnValue({
      mutate: vi.fn().mockImplementation((_payload, options) => {
        if (options && options.onSuccess) {
          options.onSuccess({ message: 'تم تحديث بيانات المتبرع بنجاح' });
        }
      }),
      isPending: false,
      isSuccess: false,
      reset: vi.fn(),
    });

    mockUseDonor.mockReturnValue({
      data: sampleDonorsResponse.data[0],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    mockFetchDonorById.mockResolvedValue({
      data: sampleDonorsResponse.data[0],
    });
  });

  it('renders the donors list correctly', () => {
    render(<AdminDonors />);

    expect(screen.getByText('المتبرعون')).toBeInTheDocument();
    expect(screen.getByText('2 متبرع مسجل في النظام')).toBeInTheDocument();
    expect(screen.getByText('أحمد محمود علي')).toBeInTheDocument();
    expect(screen.getByText('D-1234')).toBeInTheDocument();
    expect(screen.getByText('منى أحمد السيد')).toBeInTheDocument();
    expect(screen.getAllByText('A+').length).toBeGreaterThan(0);
    expect(screen.getAllByText('O-').length).toBeGreaterThan(0);
  });

  it('handles searching and filtering', () => {
    render(<AdminDonors />);

    const searchInput = screen.getByPlaceholderText('ابحث بالاسم أو الرمز أو الهاتف...');
    fireEvent.change(searchInput, { target: { value: 'أحمد' } });

    expect(mockUsePaginatedDonors).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'أحمد',
      })
    );

    const selects = screen.getAllByRole('combobox');
    
    // Blood type select (index 0)
    fireEvent.change(selects[0], { target: { value: 'A+' } });
    expect(mockUsePaginatedDonors).toHaveBeenCalledWith(
      expect.objectContaining({
        bloodType: 'A+',
      })
    );

    // Status select (index 1)
    fireEvent.change(selects[1], { target: { value: 'eligible' } });
    expect(mockUsePaginatedDonors).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'eligible',
      })
    );

    // City select (index 2)
    fireEvent.change(selects[2], { target: { value: 'مركز وبندر بني سويف' } });
    expect(mockUsePaginatedDonors).toHaveBeenCalledWith(
      expect.objectContaining({
        district: 'مركز وبندر بني سويف',
      })
    );
  });

  it('opens and displays the View Donor details modal', async () => {
    render(<AdminDonors />);

    const viewButtons = screen.getAllByText('عرض');
    fireEvent.click(viewButtons[0]);

    // View modal details check
    expect(screen.getByText('تفاصيل المتبرع')).toBeInTheDocument();
    expect(screen.getByText('الاسم الكامل')).toBeInTheDocument();
    expect(screen.getByText('الرقم القومي')).toBeInTheDocument();
    expect(screen.getByText('النقاط المكتسبة')).toBeInTheDocument();

    // Close view modal
    const closeBtn = screen.getByText('إغلاق');
    fireEvent.click(closeBtn);

    expect(screen.queryByText('تفاصيل المتبرع')).not.toBeInTheDocument();
  });

  it('opens and updates the Edit Donor modal with validations', async () => {
    const mutateSpy = vi.fn().mockImplementation((_args, options) => {
      options.onSuccess({ message: 'Success' });
    });
    mockUseUpdateDonor.mockReturnValue({
      mutate: mutateSpy,
      isPending: false,
      isSuccess: false,
      reset: vi.fn(),
    });

    render(<AdminDonors />);

    const editButtons = screen.getAllByText('تعديل');
    fireEvent.click(editButtons[0]);

    // Check modal shows
    await waitFor(() => {
      expect(screen.getByText('تعديل بيانات المتبرع')).toBeInTheDocument();
    });

    const phoneInput = screen.getByDisplayValue('01011112222');
    const nationalIdInput = screen.getByDisplayValue('29001012409876');

    // Test phone validation (empty)
    fireEvent.change(phoneInput, { target: { value: '' } });
    fireEvent.click(screen.getByText('حفظ التعديلات'));
    expect(toast.error).toHaveBeenCalledWith('يرجى إدخال رقم الهاتف');

    // Test phone validation (invalid format)
    fireEvent.change(phoneInput, { target: { value: '123456' } });
    fireEvent.click(screen.getByText('حفظ التعديلات'));
    expect(toast.error).toHaveBeenCalledWith('رقم الهاتف المحمول غير صحيح، يجب أن يتكون من 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015');

    // Fix phone, test National ID validation (empty)
    fireEvent.change(phoneInput, { target: { value: '01011112222' } });
    fireEvent.change(nationalIdInput, { target: { value: '' } });
    fireEvent.click(screen.getByText('حفظ التعديلات'));
    expect(toast.error).toHaveBeenCalledWith('يرجى إدخال الرقم القومي');

    // Test National ID validation (invalid format)
    fireEvent.change(nationalIdInput, { target: { value: '123456789' } });
    fireEvent.click(screen.getByText('حفظ التعديلات'));
    expect(toast.error).toHaveBeenCalledWith('الرقم القومي غير صحيح، يجب أن يتكون من 14 رقماً');

    // Fix National ID and save successfully
    fireEvent.change(nationalIdInput, { target: { value: '29001012409876' } });
    fireEvent.click(screen.getByText('حفظ التعديلات'));

    await waitFor(() => {
      expect(mutateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'donor-1',
          payload: expect.objectContaining({
            phone: '01011112222',
            nationalId: '29001012409876',
          }),
        }),
        expect.any(Object)
      );
    });

    expect(toast.success).toHaveBeenCalledWith('تم تحديث بيانات المتبرع بنجاح');
  });

  it('shows loading skeleton when query is loading', () => {
    mockUsePaginatedDonors.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });

    render(<AdminDonors />);
    expect(screen.queryByText('المتبرعون')).not.toBeInTheDocument();
  });

  it('shows error state when query fails and allows retry', () => {
    const mockRefetch = vi.fn();
    mockUsePaginatedDonors.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    });

    render(<AdminDonors />);

    expect(screen.getByText('تعذر تحميل بيانات المتبرعين')).toBeInTheDocument();
    
    const retryBtn = screen.getByText('إعادة المحاولة');
    fireEvent.click(retryBtn);
    expect(mockRefetch).toHaveBeenCalled();
  });
});
