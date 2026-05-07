// ═══════════════════════════════════════════════════════════
// Emergency API service — hospital emergency blood requests
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type { EmergencyRequest, FulfillEmergencyPayload } from '../types/emergency';

// ── Mock mode flag ─────────────────────────────────────────
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ── Mock data (kept here, not in mockData.ts) ──────────────
const MOCK_EMERGENCY: EmergencyRequest[] = [
  {
    id: 1,
    hospital: 'مستشفى بني سويف العام',
    bloodType: 'O-',
    units: 5,
    urgency: 'critical',
    status: 'pending',
    requester: 'د. محمد سالم',
    requestDate: '2025-04-26 09:15',
    reason: 'عملية قلب مفتوح طارئة',
  },
  {
    id: 2,
    hospital: 'مستشفى ناصر المركزي',
    bloodType: 'AB+',
    units: 3,
    urgency: 'high',
    status: 'pending',
    requester: 'د. أحمد فؤاد',
    requestDate: '2025-04-26 10:30',
    reason: 'نزيف حاد — حادث مروري',
  },
  {
    id: 3,
    hospital: 'مستشفى الواسطى',
    bloodType: 'A+',
    units: 4,
    urgency: 'medium',
    status: 'pending',
    requester: 'د. سارة أحمد',
    requestDate: '2025-04-26 11:00',
    reason: 'عملية ولادة معقدة',
  },
  {
    id: 4,
    hospital: 'مستشفى ببا المركزي',
    bloodType: 'B+',
    units: 2,
    urgency: 'critical',
    status: 'fulfilled',
    requester: 'د. خالد عيسى',
    requestDate: '2025-04-25 14:20',
    reason: 'حالة فقر دم حاد',
  },
  {
    id: 5,
    hospital: 'مستشفى الفشن',
    bloodType: 'O+',
    units: 6,
    urgency: 'high',
    status: 'fulfilled',
    requester: 'د. هاني رشدي',
    requestDate: '2025-04-25 08:45',
    reason: 'حادث صناعي — إصابات متعددة',
  },
];

// ── Fetch all emergency requests ───────────────────────────
export async function fetchEmergencyRequests(): Promise<EmergencyRequest[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_EMERGENCY;
  }
  const { data } = await apiClient.get<EmergencyRequest[]>('/emergency');
  return data;
}

// ── Fulfill an emergency request ───────────────────────────
export async function fulfillEmergencyRequest(
  payload: FulfillEmergencyPayload,
): Promise<EmergencyRequest> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    const req = MOCK_EMERGENCY.find((r) => r.id === payload.requestId);
    if (!req) {
      throw {
        response: { status: 404, data: { message: 'الطلب غير موجود' } },
      };
    }
    req.status = 'fulfilled';
    return { ...req };
  }
  const { data } = await apiClient.post<EmergencyRequest>(
    `/emergency/${payload.requestId}/fulfill`,
    payload,
  );
  return data;
}

// ── Reject an emergency request ────────────────────────────
export async function rejectEmergencyRequest(requestId: number): Promise<EmergencyRequest> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const req = MOCK_EMERGENCY.find((r) => r.id === requestId);
    if (!req) {
      throw {
        response: { status: 404, data: { message: 'الطلب غير موجود' } },
      };
    }
    req.status = 'rejected';
    return { ...req };
  }
  const { data } = await apiClient.post<EmergencyRequest>(`/emergency/${requestId}/reject`);
  return data;
}
