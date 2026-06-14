import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CancelModal } from './CancelModal';

// Mock the useCampaigns hook since we're testing the component isolated
vi.mock('../../hooks/useCampaigns', () => ({
  useCampaigns: () => ({
    data: [
      { id: 'camp1', campaignCode: 'CAMP-CODE', title: 'Test Campaign' }
    ]
  })
}));

const mockSlot = {
  id: 'slot1',
  date: '2024-05-30',
  time: '10:00',
  status: 'booked' as const,
  donorName: 'John Doe',
  campaignId: 'camp1'
};

describe('CancelModal', () => {
  it('renders the modal with slot details', () => {
    render(
      <CancelModal 
        slot={mockSlot} 
        doctorName="Dr. Smith" 
        onConfirm={vi.fn()} 
        onClose={vi.fn()} 
      />
    );

    // Verify slot details
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('2024-05-30')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
    // Verify campaign is loaded from mock
    expect(screen.getByText('Test Campaign (CAMP-CODE)')).toBeInTheDocument();
    // Verify doctor name
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
  });

  it('calls onConfirm with the reason when confirmed', async () => {
    const handleConfirm = vi.fn();
    const handleClose = vi.fn();

    render(
      <CancelModal 
        slot={mockSlot} 
        doctorName="Dr. Smith" 
        onConfirm={handleConfirm} 
        onClose={handleClose} 
      />
    );

    const reasonInput = screen.getByPlaceholderText(/مثال: ظروف طارئة/i);
    fireEvent.change(reasonInput, { target: { value: 'Patient did not show up' } });

    const confirmButton = screen.getByText('تأكيد الإلغاء');
    fireEvent.click(confirmButton);

    expect(handleConfirm).toHaveBeenCalledWith('Patient did not show up');
    
    // Test that onClose is called after confirm
    await waitFor(() => {
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();

    render(
      <CancelModal 
        slot={mockSlot} 
        doctorName="Dr. Smith" 
        onConfirm={vi.fn()} 
        onClose={handleClose} 
      />
    );

    // The close button has an X icon but we can find it by its onClick or structure,
    // let's just find "تراجع" (Cancel) which also calls onClose.
    const cancelButton = screen.getByText('تراجع');
    fireEvent.click(cancelButton);

    expect(handleClose).toHaveBeenCalled();
  });
});
