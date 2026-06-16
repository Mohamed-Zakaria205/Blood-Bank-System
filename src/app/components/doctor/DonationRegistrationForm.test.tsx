import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import DonationRegistrationForm from './DonationRegistrationForm';
import { toast } from 'sonner';

// Define hoisted mocks
const {
  mockUseFilteredCampaigns,
  mockUseDonationCenters,
  mockUseAppointmentSlotById,
  mockUseSearchDonor,
  mockUseAddDonation,
  mockUseAddMedicalRecord,
  mockUseDeleteDonation,
  mockUseNavigate,
  mockUseSearchParams,
} = vi.hoisted(() => {
  return {
    mockUseFilteredCampaigns: vi.fn(),
    mockUseDonationCenters: vi.fn(),
    mockUseAppointmentSlotById: vi.fn(),
    mockUseSearchDonor: vi.fn(),
    mockUseAddDonation: vi.fn(),
    mockUseAddMedicalRecord: vi.fn(),
    mockUseDeleteDonation: vi.fn(),
    mockUseNavigate: vi.fn(),
    mockUseSearchParams: vi.fn(),
  };
});

// Mock hooks
vi.mock('../../hooks/useCampaigns', () => ({
  useFilteredCampaigns: mockUseFilteredCampaigns,
}));

vi.mock('../../hooks/useAppointments', () => ({
  useAppointmentSlotById: mockUseAppointmentSlotById,
}));

vi.mock('../../hooks/useDonors', () => ({
  useSearchDonor: mockUseSearchDonor,
  useAddDonation: mockUseAddDonation,
  useAddMedicalRecord: mockUseAddMedicalRecord,
  useDonationCenters: mockUseDonationCenters,
  useDeleteDonation: mockUseDeleteDonation,
}));

// Mock react-router
vi.mock('react-router', () => ({
  useNavigate: () => mockUseNavigate,
  useSearchParams: () => mockUseSearchParams(),
}));

// Mock useAuth
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'doc-1', name: 'Dr. John' } }),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('DonationRegistrationForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock campaigns
    mockUseFilteredCampaigns.mockReturnValue({
      data: {
        data: [
          {
            id: 'camp-1',
            title: 'حملة جامعة بني سويف',
            status: 'active',
            targetDonors: 100,
            registeredDonors: 10,
          },
          {
            id: 'camp-2',
            title: 'حملة النادي الرياضي',
            status: 'completed',
            targetDonors: 100,
            registeredDonors: 95,
          },
        ],
      },
    });

    // Default mock donation centers
    mockUseDonationCenters.mockReturnValue({
      data: [
        { id: 'center-1', name: 'مركز تبرع بني سويف الرئيسي', location: 'بني سويف' },
        { id: 'center-2', name: 'مركز تبرع ببا', location: 'ببا' },
      ],
    });

    // Default no appointment
    mockUseAppointmentSlotById.mockReturnValue({
      data: null,
    });

    // Mock search mutation
    mockUseSearchDonor.mockReturnValue({
      mutate: vi.fn((_searchId, options) => {
        options?.onSuccess?.({ data: null });
        options?.onSettled?.();
      }),
      isPending: false,
    });

    // Mock add donation mutation
    mockUseAddDonation.mockReturnValue({
      mutate: vi.fn((_payload, options) => {
        options?.onSuccess?.({ data: 'donation-123' });
        options?.onSettled?.();
      }),
      isPending: false,
    });

    // Mock add medical record mutation
    mockUseAddMedicalRecord.mockReturnValue({
      mutate: vi.fn((_payload, options) => {
        options?.onSuccess?.({ success: true });
        options?.onSettled?.();
      }),
      isPending: false,
    });

    // Mock delete donation mutation
    mockUseDeleteDonation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    // Default empty search params
    mockUseSearchParams.mockReturnValue([new URLSearchParams(), vi.fn()]);
  });

  describe('Step 1 - Basic Information Flow', () => {
    it('renders Step 1 fields correctly', () => {
      const { container } = render(<DonationRegistrationForm />);

      expect(screen.getByText('تسجيل تبرع جديد')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('ابحث بالرقم القومي (14 رقم)')).toBeInTheDocument();
      expect(container.querySelector('input[name="name"]')).toBeInTheDocument();
      expect(container.querySelector('input[name="phone"]')).toBeInTheDocument();
      expect(container.querySelector('input[name="nationalId"]')).toBeInTheDocument();
      expect(screen.getByText('داخل البنك')).toBeInTheDocument();
      expect(screen.getByText('من حملة')).toBeInTheDocument();
    });

    it('shows center selector when source is walkin, and campaign selector when source is campaign', async () => {
      render(<DonationRegistrationForm />);

      // Walkin is the default source
      const centerSelect = screen.getByText('— اختر مركز التبرع —').closest('select');
      expect(centerSelect).toBeInTheDocument();

      // Click campaign source button
      const campaignButton = screen.getByText('من حملة');
      fireEvent.click(campaignButton);

      // Now campaign select should be shown
      await waitFor(() => {
        expect(screen.getByText('— اختر الحملة —')).toBeInTheDocument();
      });
    });

    it('displays validation errors when fields are empty and user clicks next', async () => {
      render(<DonationRegistrationForm />);

      const nextButton = screen.getByRole('button', { name: /التالي/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('أدخل الاسم الثنائي على الأقل')).toBeInTheDocument();
        expect(
          screen.getByText(
            'رقم الهاتف غير صحيح، يجب أن يتكون من 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015',
          ),
        ).toBeInTheDocument();
        expect(
          screen.getByText('الرقم القومي غير صحيح أو غير متطابق مع تاريخ الميلاد'),
        ).toBeInTheDocument();
      });
    });

    it('performs donor search and fills form for existing donor', async () => {
      const mockDonor = {
        name: 'محمد أحمد علي',
        gender: 'male',
        dateOfBirth: '1990-05-15',
        phone: '01099998888',
        nationalId: '29005152409876',
        governorate: 'بني سويف',
        district: 'مركز ببا',
        area: 'الشارع الجديد',
        bloodType: 'AB-',
      };

      mockUseSearchDonor.mockReturnValue({
        mutate: vi.fn((_searchId, options) => {
          options?.onSuccess?.({ data: mockDonor });
        }),
        isPending: false,
      });

      const { container } = render(<DonationRegistrationForm />);

      const searchInput = screen.getByPlaceholderText('ابحث بالرقم القومي (14 رقم)');
      fireEvent.change(searchInput, { target: { value: '29005152409876' } });

      const searchButton = screen.getByRole('button', { name: 'بحث' });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'تم العثور على المتبرع، تم ملء البيانات تلقائياً',
        );
        expect(container.querySelector('input[name="name"]')).toHaveValue('محمد أحمد علي');
        expect(container.querySelector('input[name="phone"]')).toHaveValue('01099998888');
        expect(container.querySelector('input[name="nationalId"]')).toHaveValue('29005152409876');
        // Address check
        expect(screen.getByDisplayValue('بني سويف')).toBeInTheDocument();
        expect(screen.getByDisplayValue('مركز ببا')).toBeInTheDocument();
      });
    });

    it('displays "متبرع جديد" toast if donor search returns null', async () => {
      mockUseSearchDonor.mockReturnValue({
        mutate: vi.fn((_searchId, options) => {
          options?.onSuccess?.({ data: null });
        }),
        isPending: false,
      });

      const { container } = render(<DonationRegistrationForm />);

      const searchInput = screen.getByPlaceholderText('ابحث بالرقم القومي (14 رقم)');
      fireEvent.change(searchInput, { target: { value: '29005152409876' } });

      const searchButton = screen.getByRole('button', { name: 'بحث' });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(toast.info).toHaveBeenCalledWith('متبرع جديد، يرجى إدخال البيانات');
        // Birth date should be extracted from the national ID: 2900515... -> 1990-05-15
        const dobInput = container.querySelector('input[name="dateOfBirth"]');
        expect(dobInput).toHaveValue('1990-05-15');
      });
    });

    it('advances to Step 2 when all Step 1 inputs are valid and API succeeds', async () => {
      const { container } = render(<DonationRegistrationForm />);

      // Fill valid values
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: 'حسن حسني' },
      });

      const maleButton = screen.getByRole('button', { name: 'ذكر' });
      fireEvent.click(maleButton);

      fireEvent.change(container.querySelector('input[name="dateOfBirth"]')!, {
        target: { value: '1995-10-10' },
      });
      fireEvent.change(container.querySelector('input[name="phone"]')!, {
        target: { value: '01234567890' },
      });
      fireEvent.change(container.querySelector('input[name="nationalId"]')!, {
        target: { value: '29510102409876' },
      });

      // Governorate select
      const govSelect = screen.getByText('— اختر المحافظة —').closest('select')!;
      fireEvent.change(govSelect, { target: { value: 'بني سويف' } });

      // District select
      const districtSelect = screen.getByText('— اختر المركز —').closest('select')!;
      fireEvent.change(districtSelect, { target: { value: 'مركز وبندر بني سويف' } });

      // Area select/input filling
      const areaSelect = screen.queryByText('— اختر المنطقة —')?.closest('select');
      if (areaSelect) {
        fireEvent.change(areaSelect, { target: { value: 'المرماح' } });
      } else {
        const areaInput = container.querySelector('input[name="area"]');
        if (areaInput) {
          fireEvent.change(areaInput, { target: { value: 'المرماح' } });
        }
      }

      // Select Donation Center
      const centerSelect = screen.getByText('— اختر مركز التبرع —').closest('select')!;
      fireEvent.change(centerSelect, { target: { value: 'center-1' } });

      // Click Next
      const nextButton = screen.getByRole('button', { name: /التالي/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(mockUseAddDonation).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('تم تسجيل التبرع المبدئي بنجاح');
        // We should be in Step 2: "البيانات الطبية" header
        expect(
          screen.getByText((_, el) => el?.textContent?.replace(/\s+/g, '') === 'البياناتالطبية'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Step 2 - Medical Information Flow', () => {
    // Helper to transition to Step 2
    const fillStepOneAndMoveToStepTwo = async (container: HTMLElement) => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: 'حسن حسني' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'ذكر' }));
      fireEvent.change(container.querySelector('input[name="dateOfBirth"]')!, {
        target: { value: '1995-10-10' },
      });
      fireEvent.change(container.querySelector('input[name="phone"]')!, {
        target: { value: '01234567890' },
      });
      fireEvent.change(container.querySelector('input[name="nationalId"]')!, {
        target: { value: '29510102409876' },
      });

      const govSelect = screen.getByText('— اختر المحافظة —').closest('select')!;
      fireEvent.change(govSelect, { target: { value: 'بني سويف' } });

      const districtSelect = screen.getByText('— اختر المركز —').closest('select')!;
      fireEvent.change(districtSelect, { target: { value: 'مركز وبندر بني سويف' } });

      const areaSelect = screen.queryByText('— اختر المنطقة —')?.closest('select');
      if (areaSelect) {
        fireEvent.change(areaSelect, { target: { value: 'المرماح' } });
      } else {
        const areaInput = container.querySelector('input[name="area"]');
        if (areaInput) {
          fireEvent.change(areaInput, { target: { value: 'المرماح' } });
        }
      }

      const centerSelect = screen.getByText('— اختر مركز التبرع —').closest('select')!;
      fireEvent.change(centerSelect, { target: { value: 'center-1' } });
      fireEvent.click(screen.getByRole('button', { name: /التالي/i }));
      await waitFor(() => {
        expect(
          screen.getByText((_, el) => el?.textContent?.replace(/\s+/g, '') === 'البياناتالطبية'),
        ).toBeInTheDocument();
      });
    };

    it('renders Step 2 inputs properly', async () => {
      const { container } = render(<DonationRegistrationForm />);
      await fillStepOneAndMoveToStepTwo(container);

      expect(screen.getByText('فصيلة الدم')).toBeInTheDocument();
      expect(screen.getByText('نوع التبرع')).toBeInTheDocument();
      expect(screen.getByText('الوزن (كغ)')).toBeInTheDocument();
      expect(screen.getByText('ضغط الدم')).toBeInTheDocument();
      expect(screen.getByText('الهيموجلوبين')).toBeInTheDocument();
      expect(screen.getByText('الأمراض المزمنة')).toBeInTheDocument();
      expect(screen.getByText('حالة المتبرع *')).toBeInTheDocument();
    });

    it('shows deferred details when status is set to deferred, and rejection details when status is ineligible', async () => {
      const { container } = render(<DonationRegistrationForm />);
      await fillStepOneAndMoveToStepTwo(container);

      // Click "موجل" button
      const deferredButton = screen.getByText('موجل ⏳');
      fireEvent.click(deferredButton);

      await waitFor(() => {
        expect(screen.getByText('سبب التأجيل')).toBeInTheDocument();
        expect(screen.getByText('موجل حتى')).toBeInTheDocument();
      });

      // Click "غير مؤهل" button
      const ineligibleButton = screen.getByText('غير مؤهل ❌');
      fireEvent.click(ineligibleButton);

      await waitFor(() => {
        expect(screen.getByText('سبب الرفض')).toBeInTheDocument();
        expect(screen.queryByText('موجل حتى')).not.toBeInTheDocument();
      });
    });

    it('toggles disease options correctly in chronic diseases section', async () => {
      const { container } = render(<DonationRegistrationForm />);
      await fillStepOneAndMoveToStepTwo(container);

      // Click diabetes button
      const diabetesButton = screen.getByText('السكري');
      fireEvent.click(diabetesButton);

      await waitFor(() => {
        expect(screen.getByText('محدد: السكري')).toBeInTheDocument();
      });

      // Click again to untoggle
      fireEvent.click(diabetesButton);
      await waitFor(() => {
        expect(screen.queryByText('محدد: السكري')).not.toBeInTheDocument();
      });
    });

    it('returns to Step 1 when clicking back button and retains form data', async () => {
      const { container } = render(<DonationRegistrationForm />);
      await fillStepOneAndMoveToStepTwo(container);

      const backButton = screen.getByRole('button', { name: /رجوع/i });
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(container.querySelector('input[name="name"]')).toHaveValue('حسن حسني');
        expect(container.querySelector('input[name="nationalId"]')).toHaveValue('29510102409876');
      });
    });

    it('submits medical record and redirects on successful submit', async () => {
      const { container } = render(<DonationRegistrationForm />);
      await fillStepOneAndMoveToStepTwo(container);

      // Select blood type B+
      const bPlusButton = screen.getByText('B+');
      fireEvent.click(bPlusButton);

      // Fill weight, pressure, hemoglobin
      fireEvent.change(container.querySelector('input[name="weight"]')!, {
        target: { value: '80' },
      });
      fireEvent.change(container.querySelector('input[name="bloodPressure"]')!, {
        target: { value: '120/80' },
      });
      fireEvent.change(container.querySelector('input[name="hemoglobin"]')!, {
        target: { value: '14.0' },
      });

      // Click submit
      const submitButton = screen.getByRole('button', { name: /تسجيل التبرع/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUseAddMedicalRecord).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('تم تسجيل البيانات الطبية بنجاح');
        expect(mockUseNavigate).toHaveBeenCalledWith('/doctor/donations');
      });
    });
  });

  describe('Appointment Pre-fill Flow', () => {
    it('pre-fills fields and renders appointment banner when apt param is present', async () => {
      const mockAppointment = {
        id: 'apt-777',
        donorName: 'أسامة حسني',
        donorGender: 'male',
        donorPhone: '01011112222',
        donorNationalId: '29812152409876',
        donorGovernorate: 'بني سويف',
        donorDistrict: 'مركز ببا',
        donorArea: 'الجزيرة',
        donorBloodType: 'O+',
        donationType: 'plasma',
        time: '14:30',
        campaignId: 'camp-1',
      };

      // Mock searchParams to return apt=apt-777
      mockUseSearchParams.mockReturnValue([new URLSearchParams('?apt=apt-777'), vi.fn()]);

      // Mock useAppointmentSlotById to return mockAppointment
      mockUseAppointmentSlotById.mockReturnValue({
        data: mockAppointment,
      });

      const { container } = render(<DonationRegistrationForm />);

      await waitFor(() => {
        // Pre-fill banner assertion
        expect(screen.getByText(/موعد محجوز من التطبيق — 14:30/i)).toBeInTheDocument();

        // Assert pre-filled form fields
        expect(container.querySelector('input[name="name"]')).toHaveValue('أسامة حسني');
        expect(container.querySelector('input[name="phone"]')).toHaveValue('01011112222');
        expect(container.querySelector('input[name="nationalId"]')).toHaveValue('29812152409876');
        expect(screen.getByDisplayValue('بني سويف')).toBeInTheDocument();
        expect(screen.getByDisplayValue('مركز ببا')).toBeInTheDocument();
      });
    });
  });
});
