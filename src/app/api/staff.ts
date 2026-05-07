// ═══════════════════════════════════════════════════════════
// Staff (users) API service
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type { User, UserRole } from '../types/auth';
import { users as MOCK_USERS } from '../data/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export async function fetchStaff(): Promise<User[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    // Strip passwords before returning, and filter out admins (staff view only)
    return MOCK_USERS.filter((u) => u.role !== 'admin').map(({ password: _, ...u }) => u) as User[];
  }
  const { data } = await apiClient.get<User[]>('/staff');
  return data;
}

export async function createStaff(payload: {
  name: string;
  email: string;
  password: string;
  role: string;
  nationalId: string;
  phone: string;
  address: string;
  city: string;
}): Promise<User> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    const newUser: User = {
      id: `USR-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      role: payload.role as UserRole,
      age: 0,
      nationalId: payload.nationalId,
      phone: payload.phone,
      address: payload.address,
      city: payload.city,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    return newUser;
  }
  const { data } = await apiClient.post<User>('/staff', payload);
  return data;
}

export async function deleteStaff(id: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return;
  }
  await apiClient.delete(`/staff/${id}`);
}
