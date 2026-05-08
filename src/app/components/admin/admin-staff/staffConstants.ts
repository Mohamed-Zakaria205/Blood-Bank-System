import {
  FlaskConical,
  Stethoscope,
  Package,
} from 'lucide-react';
import { z } from 'zod';

export type StaffRole = 'doctor' | 'lab' | 'inventory';

export const roleConfig: Record<
  StaffRole,
  {
    label: string;
    badge: string;
    prefix: string;
    color: string;
    borderColor: string;
    bgColor: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  doctor: {
    label: 'طبيب',
    badge: 'bg-teal-100 text-teal-700',
    prefix: 'dr',
    color: 'text-teal-700',
    borderColor: 'border-teal-200',
    bgColor: 'bg-teal-50',
    icon: Stethoscope,
  },
  lab: {
    label: 'دكتور تحاليل',
    badge: 'bg-green-100 text-green-700',
    prefix: 'lab',
    color: 'text-green-700',
    borderColor: 'border-green-200',
    bgColor: 'bg-green-50',
    icon: FlaskConical,
  },
  inventory: {
    label: 'أمين مخزن',
    badge: 'bg-blue-100 text-blue-700',
    prefix: 'inv',
    color: 'text-blue-700',
    borderColor: 'border-blue-200',
    bgColor: 'bg-blue-50',
    icon: Package,
  },
};

export const staffSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'أدخل الاسم الثلاثي على الأقل')
    .refine(
      (value) => value.split(/\s+/).filter(Boolean).length >= 2,
      'أدخل الاسم الثلاثي على الأقل',
    ),
  nationalId: z.string().regex(/^\d{14}$/, 'رقم الهوية يجب أن يكون 14 رقماً'),
  phone: z.string().min(11, 'رقم الهاتف يجب أن يكون 11 رقماً على الأقل'),
  address: z.string().trim().min(1, 'أدخل العنوان'),
  city: z.string(),
  email: z.string().trim().email('أدخل بريداً إلكترونياً صحيحاً'),
  password: z.string().min(6, 'كلمة المرور 6 أحرف على الأقل'),
  role: z.enum(['doctor', 'lab', 'inventory']),
});

export type StaffForm = z.infer<typeof staffSchema>;

export const initialForm: StaffForm = {
  fullName: '',
  nationalId: '',
  phone: '',
  address: '',
  city: 'بني سويف',
  email: '',
  password: '',
  role: 'doctor',
};
