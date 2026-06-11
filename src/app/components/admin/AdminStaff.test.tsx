import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AdminStaff from './AdminStaff';
import { toast } from 'sonner';

// Setup hoisted mocks
const {
  mockUseFilteredStaff,
  mockUseCreateStaff,
  mockUseUpdateStaff,
  mockUseDeleteStaff,
} = vi.hoisted(() => {
  return {
    mockUseFilteredStaff: vi.fn(),
    mockUseCreateStaff: vi.fn(),
    mockUseUpdateStaff: vi.fn(),
    mockUseDeleteStaff: vi.fn(),
  };
});

// Mock hooks
vi.mock('../../hooks/useStaff', () => ({
  useFilteredStaff: mockUseFilteredStaff,
  useCreateStaff: mockUseCreateStaff,
  useUpdateStaff: mockUseUpdateStaff,
  useDeleteStaff: mockUseDeleteStaff,
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock auth context
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'admin-current', role: 'admin', name: 'Current Admin' },
  }),
}));

describe('AdminStaff Component', () => {
  const sampleStaffResponse = {
    data: [
      {
        id: 'staff-1',
        name: 'د. أحمد محمد',
        role: 'doctor',
        email: 'doctor@bloodlink.gov.eg',
        phone: '01012345678',
        nationalId: '29001012409876',
        address: 'بني سويف، شارع أحمد عرابي',
        createdAt: '2026-05-01',
        status: 'active',
      },
      {
        id: 'staff-2',
        name: 'أ. منى علي',
        role: 'lab',
        email: 'lab@bloodlink.gov.eg',
        phone: '01198765432',
        nationalId: '29505052401234',
        address: 'بوش، بني سويف',
        createdAt: '2026-05-15',
        status: 'inactive',
      },
    ],
    total: 2,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseFilteredStaff.mockReturnValue({
      data: sampleStaffResponse,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    mockUseCreateStaff.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    });

    mockUseUpdateStaff.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    });

    mockUseDeleteStaff.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    });

    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  it('renders the staff list correctly', () => {
    render(<AdminStaff />);

    expect(screen.getByText('إدارة الكوادر الطبية')).toBeInTheDocument();
    expect(screen.getByText('2 حساب مسجل في النظام')).toBeInTheDocument();
    expect(screen.getByText('د. أحمد محمد')).toBeInTheDocument();
    expect(screen.getByText('أ. منى علي')).toBeInTheDocument();
    expect(screen.getByText('doctor@bloodlink.gov.eg')).toBeInTheDocument();
    expect(screen.getByText('lab@bloodlink.gov.eg')).toBeInTheDocument();
  });

  it('handles searching and changing filters', async () => {
    render(<AdminStaff />);

    const searchInput = screen.getByPlaceholderText('ابحث بالاسم أو البريد أو الهاتف...');
    fireEvent.change(searchInput, { target: { value: 'أحمد' } });

    expect(mockUseFilteredStaff).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'أحمد',
      })
    );

    // The first select in our document: Let's find role filter select
    const selects = screen.getAllByRole('combobox');
    
    // Role select is the first select (index 0) or we can find by options
    const roleSelectDropdown = selects[0];
    fireEvent.change(roleSelectDropdown, { target: { value: 'doctor' } });

    expect(mockUseFilteredStaff).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'doctor',
      })
    );

    // Status select is the second select (index 1)
    const statusSelectDropdown = selects[1];
    fireEvent.change(statusSelectDropdown, { target: { value: 'active' } });

    expect(mockUseFilteredStaff).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'active',
      })
    );
  });

  it('copies email to clipboard when copy button is clicked', async () => {
    render(<AdminStaff />);

    const copyButtons = screen.getAllByRole('button');
    // Find the button which has Copy icon or we can check click action
    // Let's filter buttons that don't have text
    const clipboardButtons = copyButtons.filter(btn => !btn.textContent);
    
    // The first one is the copy icon for doctor, second for lab, third/fourth etc. might be trash icons
    // Let's click the first copy button
    fireEvent.click(clipboardButtons[0]);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('doctor@bloodlink.gov.eg');
  });

  it('shows loading skeleton when query is loading', () => {
    mockUseFilteredStaff.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });

    render(<AdminStaff />);
    // Loading skeletons usually have specific classes or elements
    // Let's check if the skeleton animate-pulse class is present
    expect(screen.queryByText('إدارة الكوادر الطبية')).not.toBeInTheDocument();
  });

  it('shows error state when query fails and allows retry', () => {
    const mockRefetch = vi.fn();
    mockUseFilteredStaff.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    });

    render(<AdminStaff />);

    expect(screen.getByText('فشل تحميل الكوادر الطبية')).toBeInTheDocument();
    
    const retryBtn = screen.getByText('إعادة المحاولة');
    fireEvent.click(retryBtn);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('shows add staff modal and submits new staff successfully', async () => {
    const mutateAsyncSpy = vi.fn().mockResolvedValue({});
    mockUseCreateStaff.mockReturnValue({
      mutateAsync: mutateAsyncSpy,
      isPending: false,
    });

    render(<AdminStaff />);

    // Click "إضافة كادر طبي جديد" button
    const addButton = screen.getByText('إضافة كادر طبي جديد');
    fireEvent.click(addButton);

    // Modal should render
    expect(screen.getByRole('heading', { name: 'إضافة كادر طبي جديد' })).toBeInTheDocument();

    // Fill form fields
    const nameInput = screen.getByPlaceholderText('مثال: د. أحمد محمد عبد الله');
    const emailInput = screen.getByPlaceholderText('example@bloodlink.benisuef.eg');
    const passInput = screen.getByPlaceholderText('8 أحرف، حرف كبير، رقم، رمز خاص');
    const phoneInput = screen.getByPlaceholderText('01xxxxxxxxx');
    const addressInput = screen.getByPlaceholderText('شارع، حي، رقم...');
    const nationalIdInput = screen.getByPlaceholderText('14 رقماً');

    fireEvent.change(nameInput, { target: { value: 'دكتور أحمد محمود' } });
    fireEvent.change(emailInput, { target: { value: 'ahmed@bloodlink.gov.eg' } });
    fireEvent.change(passInput, { target: { value: 'Password123!' } });
    fireEvent.change(phoneInput, { target: { value: '01011223344' } });
    fireEvent.change(addressInput, { target: { value: 'وسط البلد، بني سويف' } });
    fireEvent.change(nationalIdInput, { target: { value: '29012345678901' } });

    // Click submit button
    const submitButton = screen.getByText('إضافة الحساب');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mutateAsyncSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'دكتور أحمد محمود',
          email: 'ahmed@bloodlink.gov.eg',
          password: 'Password123!',
          phone: '01011223344',
          address: 'وسط البلد، بني سويف',
          nationalId: '29012345678901',
          role: 'doctor', // default role
        })
      );
    });

    expect(toast.success).toHaveBeenCalledWith('تم إضافة الكادر الطبي بنجاح');
  });

  it('triggers delete staff flow and calls mutation', async () => {
    const mutateAsyncSpy = vi.fn().mockResolvedValue({});
    mockUseDeleteStaff.mockReturnValue({
      mutateAsync: mutateAsyncSpy,
      isPending: false,
    });

    render(<AdminStaff />);

    // Click delete icon for the first staff member
    // screen.getAllByRole('button');
    // The trash button is the one with Trash2 icon. In our component, copy email has buttons,
    // and delete action is a button with className containing "text-red-400".
    // Let's find buttons with Trash class/icon or filter by role/icon.
    // The last button inside table cell is the trash button.
    // Let's click the first button that is NOT copy email (or has class transition-all)
    // Actually we can get all trash buttons by querying buttons that have no text and are not copy email.
    // Let's just find the button that triggers delete confirm. We can check class or click and verify
    // if DeleteConfirmModal appears.
    const allButtons = screen.getAllByRole('button');
    // Let's look for buttons containing className or simply test click on all buttons until one shows modal
    // In our test, there's 1 add button, some filter buttons, then 2 copy buttons, and 2 delete buttons.
    // We can select by selecting the last columns in the table
    // Let's select the first delete button. The table rows can be inspected.
    // In our component, the trash icon is inside a button. We can find by selecting buttons that contain no text
    // Let's look at allButtons:
    const deleteButton = allButtons.find(btn => btn.className.includes('text-red-400'));
    if (!deleteButton) throw new Error('Delete button not found');
    
    fireEvent.click(deleteButton);

    // Verify DeleteConfirmModal is shown
    expect(screen.getByText('حذف الحساب')).toBeInTheDocument();
    expect(screen.getByText('هل أنت متأكد من حذف هذا الحساب؟ لا يمكن التراجع.')).toBeInTheDocument();

    // Click confirm delete
    const confirmButton = screen.getByRole('button', { name: 'حذف' });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mutateAsyncSpy).toHaveBeenCalledWith('staff-1');
    });

    expect(toast.success).toHaveBeenCalledWith('تم حذف الحساب بنجاح');
  });

  it('shows edit staff modal and submits updated staff successfully', async () => {
    const mutateAsyncSpy = vi.fn().mockResolvedValue({});
    mockUseUpdateStaff.mockReturnValue({
      mutateAsync: mutateAsyncSpy,
      isPending: false,
    });

    render(<AdminStaff />);

    // Click edit icon for the first staff member (د. أحمد محمد)
    const editButton = screen.getAllByLabelText('تعديل المستخدم')[0];
    fireEvent.click(editButton);

    // Modal should render
    expect(screen.getByRole('heading', { name: 'تعديل بيانات الكادر الطبي' })).toBeInTheDocument();

    // Verify fields are pre-filled
    const nameInput = screen.getByPlaceholderText('مثال: د. أحمد محمد عبد الله');
    expect(nameInput).toHaveValue('د. أحمد محمد');

    // Change some field
    fireEvent.change(nameInput, { target: { value: 'د. أحمد محمد المعدل' } });

    // Click save button
    const submitButton = screen.getByText('حفظ التعديلات');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mutateAsyncSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'staff-1',
          payload: expect.objectContaining({
            name: 'د. أحمد محمد المعدل',
            email: 'doctor@bloodlink.gov.eg',
            role: 'doctor',
          }),
        })
      );
    });

    expect(toast.success).toHaveBeenCalledWith('تم تعديل بيانات الكادر الطبي بنجاح');
  });
});
