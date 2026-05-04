// ═══════════════════════════════════════════════════════════
// Emergency types — urgent blood requests from hospitals
// ═══════════════════════════════════════════════════════════
import type { BloodType } from './common';

export type EmergencyUrgency = 'critical' | 'high' | 'medium';
export type EmergencyStatus = 'pending' | 'fulfilled' | 'rejected';

/** A hospital's emergency blood request */
export interface EmergencyRequest {
  id: number;
  hospital: string;
  bloodType: BloodType;
  units: number;
  urgency: EmergencyUrgency;
  status: EmergencyStatus;
  requester: string;
  requestDate: string;
  reason: string;
}

/** POST /emergency/fulfill — request body */
export interface FulfillEmergencyPayload {
  requestId: number;
  unitsSent: number;
  notes?: string;
}
