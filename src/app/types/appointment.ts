// ═══════════════════════════════════════════════════════════
// Appointment types
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

export interface AppointmentBooking {
  id: string;
  donorName: string;
  donorCode?: string;
  phone: string;
  bloodType?: BloodType;
  source: 'app' | 'manual';
  status: 'confirmed' | 'cancelled';
}

export interface AppointmentSlot {
  id: string;
  date: string;
  time: string;
  capacity: number;
  bookings: AppointmentBooking[];
  isDisabled: boolean;
  campaignId?: string;
}

export interface TimeSlot {
  time: string;
  status: 'available' | 'booked';
  donorName?: string;
  donorCode?: string;
}

export interface AppointmentDay {
  date: string;
  slots: TimeSlot[];
}

export type Slot15Status =
  | 'available'
  | 'booked'
  | 'completed'
  | 'missed'
  | 'disabled'
  | 'cancelled';

export interface Slot15 {
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
  donorDistrict?: string;
  donorArea?: string;
  donationType?: DonationType;
  status: Slot15Status;
  campaignId?: string;
  notes?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancelledByName?: string;
  cancellationReason?: string;
}
