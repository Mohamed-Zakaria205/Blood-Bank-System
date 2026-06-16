import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import RoleGuard from './RoleGuard';
import { useAuth } from '../../contexts/AuthContext';
import { MemoryRouter, Routes, Route } from 'react-router';

// Mock useAuth
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock react-router useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('RoleGuard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderGuard = (allowedRole: string) => {
    return render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={<RoleGuard allowedRole={allowedRole} />}>
            <Route index element={<div>Protected Content Renders</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
  };

  it('redirects to /login if user is null', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null } as any);

    renderGuard('admin');

    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    expect(screen.queryByText('Protected Content Renders')).not.toBeInTheDocument();
    expect(screen.queryByText('غير مصرح بالدخول')).not.toBeInTheDocument();
  });

  it('renders UnauthorizedPage if user role does not match allowedRole', () => {
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'doctor' } } as any);

    renderGuard('admin');

    expect(screen.getByText('غير مصرح بالدخول')).toBeInTheDocument();
    expect(screen.getByText('ليس لديك صلاحية للوصول إلى هذه الصفحة')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content Renders')).not.toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('renders child route content if user role matches allowedRole', () => {
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'admin' } } as any);

    renderGuard('admin');

    expect(screen.getByText('Protected Content Renders')).toBeInTheDocument();
    expect(screen.queryByText('غير مصرح بالدخول')).not.toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('works for other roles (e.g. doctor, lab, inventory)', () => {
    // 1. Doctor
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'doctor' } } as any);
    const { unmount: unmountDoc } = renderGuard('doctor');
    expect(screen.getByText('Protected Content Renders')).toBeInTheDocument();
    unmountDoc();

    // 2. Lab
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'lab' } } as any);
    const { unmount: unmountLab } = renderGuard('lab');
    expect(screen.getByText('Protected Content Renders')).toBeInTheDocument();
    unmountLab();

    // 3. Inventory
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'inventory' } } as any);
    const { unmount: unmountInv } = renderGuard('inventory');
    expect(screen.getByText('Protected Content Renders')).toBeInTheDocument();
    unmountInv();
  });
});
