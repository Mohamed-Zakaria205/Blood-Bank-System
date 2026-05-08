import { Building2, Lock, Bell, Shield } from 'lucide-react';

/** Sidebar tab definitions */
export const settingsTabs = [
  { id: 'system', label: 'بيانات المنشأة', icon: Building2 },
  { id: 'security', label: 'الأمان', icon: Lock },
  { id: 'notifications', label: 'الإشعارات', icon: Bell },
  { id: 'permissions', label: 'الصلاحيات', icon: Shield },
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

/** Notification toggle definitions */
export const notificationOptions = [
  {
    key: 'criticalInventory',
    label: 'تنبيه المخزون الحرج',
    desc: 'إشعار عند انخفاض مخزون أي فصيلة لمستوى حرج',
  },
  {
    key: 'newDonor',
    label: 'متبرع جديد',
    desc: 'إشعار عند تسجيل متبرع جديد في النظام',
  },
  {
    key: 'campaignUpdate',
    label: 'تحديثات الحملات',
    desc: 'إشعار عند إنشاء أو تحديث حملة تبرع',
  },
  {
    key: 'dailyReport',
    label: 'التقرير اليومي',
    desc: 'إرسال ملخص يومي بإحصاءات النظام',
  },
] as const;

export interface NotifSettings {
  criticalInventory: boolean;
  newDonor: boolean;
  campaignUpdate: boolean;
  dailyReport: boolean;
}

export const defaultNotifSettings: NotifSettings = {
  criticalInventory: true,
  newDonor: true,
  campaignUpdate: true,
  dailyReport: false,
};

/** Permissions matrix: [label, admin, doctor, lab] */
export const permissionsData: [string, boolean, boolean, boolean][] = [
  ['عرض المتبرعين', true, true, false],
  ['تعديل بيانات المتبرعين', true, false, false],
  ['تسجيل متبرع جديد', false, true, false],
  ['إنشاء حملات تبرع', false, true, false],
  ['عرض حملات التبرع', true, true, false],
  ['إدارة الأطباء ودكاترة التحاليل', true, false, false],
  ['عرض مخزون الدم', true, false, false],
  ['تحديث مخزون الدم', true, false, false],
  ['عرض التقارير (Power BI)', true, false, false],
  ['إدارة المواعيد', false, true, false],
  ['عرض طلبات التحاليل', false, false, true],
  ['إدخال نتائج التحاليل', false, false, true],
  ['تحديد صلاحية التبرع', false, false, true],
  ['إعدادات النظام', true, false, false],
];
