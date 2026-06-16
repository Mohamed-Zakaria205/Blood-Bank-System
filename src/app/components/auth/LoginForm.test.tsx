import { vi, describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';

describe('LoginForm Component', () => {
  it('should render email field with LTR directionality', () => {
    render(<LoginForm authError="" loading={false} onSubmit={vi.fn()} onInputChange={vi.fn()} />);

    const emailInput = screen.getByPlaceholderText('example@bloodlink.benisuef.eg');
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('dir', 'ltr');
  });

  it('should toggle password visibility and update button aria-label', () => {
    render(<LoginForm authError="" loading={false} onSubmit={vi.fn()} onInputChange={vi.fn()} />);

    const passwordInput = screen.getByPlaceholderText('••••••••');
    const toggleButton = screen.getByRole('button', { name: 'إظهار كلمة المرور' });

    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle to show password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'إخفاء كلمة المرور' })).toBeInTheDocument();

    // Click again to hide
    fireEvent.click(screen.getByRole('button', { name: 'إخفاء كلمة المرور' }));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should render authentication errors provided from the parent', () => {
    const errorMsg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
    render(
      <LoginForm authError={errorMsg} loading={false} onSubmit={vi.fn()} onInputChange={vi.fn()} />,
    );

    expect(screen.getByText(errorMsg)).toBeInTheDocument();
  });

  it('should display Arabic validation errors when fields are touched and left empty', async () => {
    render(<LoginForm authError="" loading={false} onSubmit={vi.fn()} onInputChange={vi.fn()} />);

    const emailInput = screen.getByPlaceholderText('example@bloodlink.benisuef.eg');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    // Focus and blur to trigger onTouched validation
    fireEvent.focus(emailInput);
    fireEvent.blur(emailInput);

    fireEvent.focus(passwordInput);
    fireEvent.blur(passwordInput);

    await waitFor(() => {
      expect(screen.getByText('يرجى إدخال البريد الإلكتروني')).toBeInTheDocument();
      expect(screen.getByText('يرجى إدخال كلمة المرور')).toBeInTheDocument();
    });
  });

  it('should display Arabic validation error for invalid email format', async () => {
    const user = userEvent.setup();
    render(<LoginForm authError="" loading={false} onSubmit={vi.fn()} onInputChange={vi.fn()} />);

    const emailInput = screen.getByPlaceholderText('example@bloodlink.benisuef.eg');
    await user.type(emailInput, 'invalidemail');
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText('يرجى إدخال بريد إلكتروني صحيح')).toBeInTheDocument();
    });
  });

  it('should call onSubmit with credentials when fields are valid', async () => {
    const user = userEvent.setup();
    const mockSubmit = vi.fn();
    render(
      <LoginForm authError="" loading={false} onSubmit={mockSubmit} onInputChange={vi.fn()} />,
    );

    const emailInput = screen.getByPlaceholderText('example@bloodlink.benisuef.eg');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    await user.type(emailInput, 'doctor@bloodlink.eg');
    await user.type(passwordInput, 'ValidPassword123');

    const submitButton = screen.getByRole('button', { name: /دخول النظام/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        email: 'doctor@bloodlink.eg',
        password: 'ValidPassword123',
      });
    });
  });

  it('should call onInputChange when user types in inputs', async () => {
    const user = userEvent.setup();
    const mockInputChange = vi.fn();
    render(
      <LoginForm authError="" loading={false} onSubmit={vi.fn()} onInputChange={mockInputChange} />,
    );

    const emailInput = screen.getByPlaceholderText('example@bloodlink.benisuef.eg');
    await user.type(emailInput, 'a');

    expect(mockInputChange).toHaveBeenCalled();
  });
});
