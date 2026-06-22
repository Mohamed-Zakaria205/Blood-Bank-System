import { Building2, Lock } from 'lucide-react';

/** Sidebar tab definitions */
export const settingsTabs = [
  { id: 'system', label: 'بيانات المنشأة', icon: Building2 },
  { id: 'security', label: 'الأمان', icon: Lock },
] as const;

/** Facility form field definitions */
export const facilityFields = [
  { label: 'اسم المنشأة', key: 'hospitalName', type: 'text' },
  { label: 'المحافظة', key: 'governorate', type: 'text' },
  { label: 'رقم الهاتف', key: 'phone', type: 'text' },
  { label: 'البريد الإلكتروني', key: 'email', type: 'email' },
  { label: 'ساعات العمل', key: 'workingHours', type: 'text' },
] as const;

export interface FacilityInfo {
  hospitalName: string;
  governorate: string;
  phone: string;
  email: string;
  workingHours: string;
}

export const defaultFacilityInfo: FacilityInfo = {
  hospitalName: 'مستشفى بني سويف العام',
  governorate: 'بني سويف',
  phone: '082-2320000',
  email: 'info@bsgh.gov.eg',
  workingHours: '8:00 صباحاً - 4:00 مساءاً',
};

