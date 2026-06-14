import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import DoctorAppointments from './DoctorAppointments';
import { toast } from 'sonner';
import { TODAY, WEEK_DATES } from './doctor-appointments/appointmentConstants';

// Setup hoisted mocks
const {
  mockUseAppointmentSlots,
  mockUseAppointmentStats,
  mockUseCancelAppointment,
  mockUseMarkNoShow,
  mockUseAppointmentsHub,
  mockNavigate,
} = vi.hoisted(() => {
  return {
    mockUseAppointmentSlots: vi.fn(),
    mockUseAppointmentStats: vi.fn(),
    mockUseCancelAppointment: vi.fn(),
    mockUseMarkNoShow: vi.fn(),
    mockUseAppointmentsHub: vi.fn(),
    mockNavigate: vi.fn(),
  };
});

// Mock hooks
vi.mock('../../hooks/useAppointments', () => ({
  useAppointmentSlots: mockUseAppointmentSlots,
  useAppointmentStats: mockUseAppointmentStats,
  useCancelAppointment: mockUseCancelAppointment,
  useMarkNoShow: mockUseMarkNoShow,
}));

vi.mock('../../hooks/useAppointmentsHub', () => ({
  useAppointmentsHub: mockUseAppointmentsHub,
}));

// Mock AuthContext
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'doc-123', name: 'Dr. John Doe' } }),
}));

// Mock react-router
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock @tanstack/react-query
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueryClient: () => ({
      invalidateQueries: vi.fn(),
    }),
  };
});

// Mock useCampaigns
vi.mock('../../hooks/useCampaigns', () => ({
  useCampaigns: () => ({
    data: [
      { id: 'camp-1', campaignCode: 'CAM-1', title: 'حملة جامعة بني سويف' },
    ],
  }),
}));

describe('DoctorAppointments Component', () => {
  const sampleSlots = [
    {
      id: 'slot-1',
      time: '10:00',
      date: TODAY,
      status: 'booked',
      donorName: 'أحمد محمود',
      donorAge: 30,
      donorGender: 'male',
      donorPhone: '01011112222',
      donorNationalId: '29601012409876',
      donorBloodType: 'A+',
      donationType: 'wholeblood',
    },
    {
      id: 'slot-2',
      time: '11:00',
      date: TODAY,
      status: 'completed',
      donorName: 'منى أحمد',
      donorAge: 25,
      donorGender: 'female',
      donorPhone: '01122223333',
      donorNationalId: '30101012409876',
      donorBloodType: 'O-',
      donationType: 'plasma',
    },
  ];

  const sampleStats = {
    booked: 1,
    completed: 1,
    missed: 0,
    cancelled: 0,
  };

  const originalToLocaleString = Date.prototype.toLocaleString;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Mock Date.prototype.toLocaleString so that it returns a valid parseable ISO date in tests
    Date.prototype.toLocaleString = function (locale?: any, options?: any) {
      if (locale === 'ar-EG') {
        return new Date().toISOString();
      }
      return originalToLocaleString.call(this, locale, options);
    };

    // Default mock query states
    mockUseAppointmentSlots.mockReturnValue({
      data: sampleSlots,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    mockUseAppointmentStats.mockReturnValue({
      data: sampleStats,
    });

    // Default mock mutations
    mockUseCancelAppointment.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
    });

    mockUseMarkNoShow.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
    });
  });

  afterEach(() => {
    Date.prototype.toLocaleString = originalToLocaleString;
  });

  const getBellButton = (container: HTMLElement) => {
    const icon = container.querySelector('.lucide-bell');
    return icon ? (icon.closest('button') as HTMLButtonElement) : null;
  };

  it('renders stats cards and today\'s appointments', () => {
    render(<DoctorAppointments />);

    // Header
    expect(screen.getByText('جدول المواعيد')).toBeInTheDocument();

    // Stats Cards
    expect(screen.getAllByText('محجوز').length).toBeGreaterThan(0);
    expect(screen.getAllByText('مكتمل').length).toBeGreaterThan(0);
    expect(screen.getAllByText('لم يحضر').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ملغى').length).toBeGreaterThan(0);

    // Slot 1: أحمد محمود
    expect(screen.getByText('أحمد محمود')).toBeInTheDocument();
    expect(screen.getByText('(30 سنة)')).toBeInTheDocument();
    expect(screen.getByText('ذكر')).toBeInTheDocument();
    expect(screen.getByText('01011112222')).toBeInTheDocument();

    // Slot 2: منى أحمد
    expect(screen.getByText('منى أحمد')).toBeInTheDocument();
    expect(screen.getByText('(25 سنة)')).toBeInTheDocument();
    expect(screen.getByText('أنثى')).toBeInTheDocument();
  });

  it('navigates to registration page on clicking "بدء التسجيل"', () => {
    render(<DoctorAppointments />);

    const slotCard = screen.getByText('أحمد محمود').closest('.rounded-xl') as HTMLElement;
    const registerBtn = within(slotCard).getByRole('button', { name: 'بدء التسجيل' });
    fireEvent.click(registerBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/doctor/register?apt=slot-1');
  });

  it('switches views (Today, Week, Month) and loads corresponding date range', async () => {
    render(<DoctorAppointments />);

    // Week view
    const weekBtn = screen.getByRole('button', { name: 'الأسبوع' });
    fireEvent.click(weekBtn);
    expect(mockUseAppointmentSlots).toHaveBeenCalledWith(
      expect.objectContaining({
        dateFrom: WEEK_DATES[0],
        dateTo: WEEK_DATES[6],
      })
    );

    // Month view
    const monthBtn = screen.getByRole('button', { name: 'الشهر' });
    fireEvent.click(monthBtn);
    expect(mockUseAppointmentSlots).toHaveBeenCalledWith(
      expect.objectContaining({
        dateFrom: expect.any(String),
        dateTo: expect.any(String),
      })
    );

    // Today view
    const todayBtn = screen.getByRole('button', { name: 'اليوم' });
    fireEvent.click(todayBtn);
    expect(mockUseAppointmentSlots).toHaveBeenCalledWith(
      expect.objectContaining({
        date: TODAY,
      })
    );
  });

  it('toggles filters when clicking stats cards or filter bar', () => {
    render(<DoctorAppointments />);

    // Click "محجوز" stats card
    const bookedCard = screen.getAllByText('محجوز')[0].closest('div')!;
    fireEvent.click(bookedCard);
    
    // Check that appointment slots query is called with status: 'booked'
    expect(mockUseAppointmentSlots).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'booked' })
    );

    // Click "الكل" in filter bar
    const allFilterBtn = screen.getByRole('button', { name: 'الكل' });
    fireEvent.click(allFilterBtn);
    expect(mockUseAppointmentSlots).toHaveBeenLastCalledWith(
      expect.not.objectContaining({ status: expect.any(String) })
    );
  });

  it('performs cancellation flow via CancelModal', async () => {
    const cancelMutationMock = vi.fn().mockResolvedValue(undefined);
    mockUseCancelAppointment.mockReturnValue({
      mutateAsync: cancelMutationMock,
    });

    render(<DoctorAppointments />);

    // Click cancel on slot-1
    const slotCard = screen.getByText('أحمد محمود').closest('.rounded-xl') as HTMLElement;
    const cancelBtn = within(slotCard).getByRole('button', { name: 'إلغاء' });
    fireEvent.click(cancelBtn);

    // CancelModal should open
    expect(screen.getByText('إلغاء الموعد')).toBeInTheDocument();
    expect(screen.getAllByText('أحمد محمود').length).toBeGreaterThan(0);

    // Type cancellation reason
    const reasonTextarea = screen.getByPlaceholderText('مثال: ظروف طارئة، تعارض في المواعيد...');
    fireEvent.change(reasonTextarea, { target: { value: 'عدم توفر سرير تبرع' } });

    // Click confirm cancel
    const confirmBtn = screen.getByRole('button', { name: 'تأكيد الإلغاء' });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(cancelMutationMock).toHaveBeenCalledWith({
        slotId: 'slot-1',
        reason: 'عدم توفر سرير تبرع',
      });
      expect(toast.success).toHaveBeenCalledWith('تم إلغاء الموعد بنجاح');
      expect(screen.queryByText('إلغاء الموعد للمتبرع')).not.toBeInTheDocument();
    });
  });

  it('marks appointment as missed (no-show)', async () => {
    const noShowMutationMock = vi.fn().mockResolvedValue(undefined);
    mockUseMarkNoShow.mockReturnValue({
      mutateAsync: noShowMutationMock,
    });

    render(<DoctorAppointments />);

    const slotCard = screen.getByText('أحمد محمود').closest('.rounded-xl') as HTMLElement;
    const noShowBtn = within(slotCard).getByRole('button', { name: 'لم يحضر' });
    fireEvent.click(noShowBtn);

    await waitFor(() => {
      expect(noShowMutationMock).toHaveBeenCalledWith('slot-1');
      expect(toast.warning).toHaveBeenCalledWith('تم تسجيل غياب أحمد محمود');
    });
  });

  it('handles remote cancellation from SignalR useAppointmentsHub hook', async () => {
    let capturedOnCancelled: Function | null = null;
    mockUseAppointmentsHub.mockImplementation((options) => {
      capturedOnCancelled = options.onCancelled;
    });

    const { container } = render(<DoctorAppointments />);

    expect(capturedOnCancelled).toBeTypeOf('function');

    const remoteNotification = {
      id: 'NOTIF-999',
      donorName: 'أسامة محمد',
      donorPhone: '01299998888',
      date: '2026-05-31',
      time: '14:00',
      cancelledAt: new Date().toISOString(),
      cancelledByName: 'المتبرع',
      reason: 'سفر مفاجئ',
    };

    // Trigger SignalR push event
    capturedOnCancelled!(remoteNotification);

    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith('إلغاء جديد: أسامة محمد — 2026-05-31');
      
      // Bell notification count should show 1 unread notification
      const bellBtn = getBellButton(container);
      expect(bellBtn).toBeInTheDocument();
      expect(bellBtn).toHaveTextContent('1');
    });
  });

  it('interacts with the notifications panel (opens, marks read, marks all read, closes)', async () => {
    // Populate localStorage with predefined notifications
    const storedNotifications = [
      {
        id: 'NOTIF-111',
        donorName: 'خالد حسني',
        donorPhone: '01055556666',
        date: '2026-05-31',
        time: '09:00',
        cancelledAt: new Date().toISOString(),
        cancelledByName: 'المتبرع',
        reason: 'تعب صحي',
        read: false,
      },
      {
        id: 'NOTIF-222',
        donorName: 'مصطفى كمال',
        donorPhone: '01155554444',
        date: '2026-05-31',
        time: '13:00',
        cancelledAt: new Date().toISOString(),
        cancelledByName: 'الطبيب',
        read: true,
      },
    ];
    localStorage.setItem('doctor_notifications', JSON.stringify(storedNotifications));

    const { container, unmount } = render(<DoctorAppointments />);

    // Notification bell should show 1 unread
    const bellBtn = getBellButton(container)!;
    expect(bellBtn).toHaveTextContent('1');

    // Click bell to open panel
    fireEvent.click(bellBtn);
    expect(screen.getByText('إشعارات الإلغاء')).toBeInTheDocument();
    expect(screen.getByText('خالد حسني')).toBeInTheDocument();
    expect(screen.getByText('مصطفى كمال')).toBeInTheDocument();

    // Click on the unread notification to mark as read
    const unreadNotifEl = screen.getByText(/خالد حسني/).closest('div')!;
    fireEvent.click(unreadNotifEl);

    // Bell should now be 0 unread
    await waitFor(() => {
      expect(bellBtn).not.toHaveTextContent('1');
    });

    // Unmount first test setup to avoid DOM pollution and multiple mounting effects
    unmount();

    // Mark all as read
    // Add another unread to verify mark all read works
    const newStoredNotifications = [
      { ...storedNotifications[0], read: false },
      { ...storedNotifications[1], read: false },
    ];
    localStorage.setItem('doctor_notifications', JSON.stringify(newStoredNotifications));
    
    // Re-render to load updated localStorage notifications
    const { container: secondContainer } = render(<DoctorAppointments />);
    const secondBellBtn = getBellButton(secondContainer)!;
    fireEvent.click(secondBellBtn);

    const markAllReadBtn = screen.getByRole('button', { name: 'تحديد الكل كمقروء' });
    fireEvent.click(markAllReadBtn);

    await waitFor(() => {
      expect(secondBellBtn).not.toHaveTextContent('2');
    });
  });

  it('renders loading, empty, and error states correctly', () => {
    // 1. Loading state
    mockUseAppointmentSlots.mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
    });
    const { unmount: unmountLoading } = render(<DoctorAppointments />);
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    unmountLoading();

    // 2. Error state
    const refetchMock = vi.fn();
    mockUseAppointmentSlots.mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
      refetch: refetchMock,
    });
    const { unmount: unmountError } = render(<DoctorAppointments />);
    expect(screen.getByText('تعذر تحميل المواعيد')).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: 'إعادة المحاولة' });
    fireEvent.click(retryBtn);
    expect(refetchMock).toHaveBeenCalled();
    unmountError();

    // 3. Empty state
    mockUseAppointmentSlots.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    const { unmount: unmountEmpty } = render(<DoctorAppointments />);
    expect(screen.getByText('لا توجد مواعيد اليوم')).toBeInTheDocument();
    unmountEmpty();
  });
});
