// ═══════════════════════════════════════════════════════════
// Appointment types — synced with backend SystemAppointmentSlotDto
// ═══════════════════════════════════════════════════════════
import type { BloodType, DonationType } from './common';

/**
 * Cancellation notification — used for both:
 *   1. Real-time SignalR push events from the backend (donor cancellations)
 *   2. Local optimistic notifications (staff/doctor cancellations)
 *
 * Backend payload fields: id, appointmentId, donorName, time, date,
 *   reason, cancelledAt, cancelledByName
 */
export interface CancellationNotification {
  id: string;
  appointmentId?: string; // from backend push — kept for backward compat
  donorName: string;
  donorPhone?: string; // only available in local optimistic notifications
  date: string;
  time: string;
  campaignId?: string; // only available in local optimistic notifications
  cancelledAt: string;
  cancelledByName: string;
  reason?: string;
  read: boolean;
}

/**
 * Status values as returned by the backend.
 * The backend is the source of truth — no client-side derivation.
 */
export type AppointmentSlotStatus = 'available' | 'booked' | 'completed' | 'missed' | 'cancelled';

/**
 * Unified appointment slot — replaces the old Slot15 interface.
 * Maps to the backend SystemAppointmentSlotDto.
 */
export interface AppointmentSlot {
  id: string;
  date: string;
  time: string;
  donorName?: string;
  donorCode?: string;
  donorNationalId?: string;
  donorPhone?: string;
  donorBloodType?: BloodType;
  donorGender?: 'male' | 'female';
  donorAge?: number;
  donorDateOfBirth?: string;
  donorGovernorate?: string;
  donorDistrict?: string;
  donorArea?: string;
  donationType?: DonationType;
  status: AppointmentSlotStatus;
  campaignId?: string;
  centerId?: string;
  notes?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancelledByName?: string;
  cancellationReason?: string;
}

/**
 * Response shape for GET /appointments/stats
 */
export interface AppointmentStats {
  booked: number;
  completed: number;
  missed: number;
  cancelled: number;
  available: number;
  total: number;
}
