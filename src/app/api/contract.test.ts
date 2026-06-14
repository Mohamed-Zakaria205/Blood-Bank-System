import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateContract, DonorContractSchema } from './contract';

describe('validateContract', () => {
  const originalWarn = console.warn;
  const mockWarn = vi.fn();
  const originalDev = import.meta.env.DEV;

  beforeEach(() => {
    console.warn = mockWarn;
    vi.clearAllMocks();
  });

  afterEach(() => {
    console.warn = originalWarn;
    // Restore dev status
    try {
      (import.meta.env as any).DEV = originalDev;
    } catch {
      // Ignored if read-only
    }
  });

  it('should log warnings when validation fails in DEV mode', () => {
    (import.meta.env as any).DEV = true;
    expect(import.meta.env.DEV).toBe(true);

    const invalidData = {
      id: 123, // should be string
      donorCode: 'D-001',
      name: 'John Doe',
      status: 'invalid-status', // not in enum
    };

    validateContract('Donor', DonorContractSchema, invalidData);

    expect(mockWarn).toHaveBeenCalled();
    expect(mockWarn.mock.calls[0][0]).toContain('[Contract Violation]');
  });

  it('should NOT log warnings when validation succeeds in DEV mode', () => {
    (import.meta.env as any).DEV = true;
    expect(import.meta.env.DEV).toBe(true);

    const validData = {
      id: 'donor-1',
      donorCode: 'D-001',
      name: 'John Doe',
      status: 'eligible',
      hasAppAccount: true,
    };

    validateContract('Donor', DonorContractSchema, validData);

    expect(mockWarn).not.toHaveBeenCalled();
  });

  it('should skip validation and NOT log warnings in production mode', () => {
    (import.meta.env as any).DEV = false;
    expect(import.meta.env.DEV).toBe(false);

    const invalidData = {
      id: 123,
      donorCode: 'D-001',
      name: 'John Doe',
      status: 'invalid-status',
    };

    validateContract('Donor', DonorContractSchema, invalidData);

    expect(mockWarn).not.toHaveBeenCalled();
  });
});
