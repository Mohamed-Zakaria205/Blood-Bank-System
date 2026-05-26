// ═══════════════════════════════════════════════════════════
// Appointment types — synced with backend SystemAppointmentSlotDto
// ═══════════════════════════════════════════════════════════
import type { BloodType, DonationType } from './common';

/**
 * In-session notification created on the client when a doctor
 * cancels an appointment. Not persisted to the backend — purely
 * ephemeral UI state scoped to the DoctorAppointments page.
 */
export interface CancellationNotification {
  id: string;
  donorName: string;
  donorPhone?: string;
  date: string;
  time: string;
  campaignId?: string;
  cancelledAt: string;
  cancelledByName: string;
  reason?: string;
  read: boolean;
}

/**
 * Status values as returned by the backend.
 * The backend is the source of truth — no client-side derivation.
 */
export type AppointmentSlotStatus =
  | 'available'
  | 'booked'
  | 'completed'
  | 'missed'
  | 'cancelled';

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
