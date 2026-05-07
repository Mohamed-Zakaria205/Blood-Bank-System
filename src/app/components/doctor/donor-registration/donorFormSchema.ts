import { z } from 'zod';

// ── Zod Schema ──
export const donorSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'أدخل الاسم الثنائي على الأقل')
      .refine(
        (value) => value.split(/\s+/).filter(Boolean).length >= 2,
        'أدخل الاسم الثنائي على الأقل',
      ),
    gender: z.string().min(1, 'اختر الجنس'),
    age: z.string().refine((value) => {
      const num = Number(value);
      return !!value && !Number.isNaN(num) && num >= 18 && num <= 65;
    }, 'العمر يجب أن يكون بين 18 و65 سنة'),
    phone: z.string().min(11, 'رقم هاتف غير صحيح'),
    nationalId: z.string().regex(/^\d{14}$/, 'رقم الهوية يجب أن يكون 14 رقماً'),
    governorate: z.string(),
    district: z.string().min(1, 'اختر المركز'),
    area: z.string().trim().min(1, 'أدخل المنطقة'),
    bloodType: z.string(),
    donationType: z.string(),
    diseases: z.array(z.string()),
    source: z.enum(['walkin', 'campaign', 'app']),
    campaignId: z.string(),
    status: z.enum(['eligible', 'ineligible', 'deferred']),
    weight: z.string(),
    bloodPressure: z.string(),
    hemoglobin: z.string(),
    isAllergic: z.boolean(),
    rejectionReason: z.string(),
    lockoutUntil: z.string(),
    deferredUntil: z.string(),
    donationTime: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.source === 'campaign' && !data.campaignId.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'اختر الحملة',
        path: ['campaignId'],
      });
    }
  });

export type SimpleForm = z.infer<typeof donorSchema>;

// ── Constants ──
export const DISTRICTS = ['بني سويف', 'ناصر', 'الواسطى', 'ببا', 'الفشن', 'إهناسيا', 'سمسطا', 'نزلة'];

export const initialForm: SimpleForm = {
  name: '',
  gender: '',
  age: '',
  phone: '',
  nationalId: '',
  governorate: 'بني سويف',
  district: 'بني سويف',
  area: '',
  bloodType: '',
  donationType: 'whole',
  diseases: [],
  source: 'walkin',
  campaignId: '',
  status: 'eligible',
  weight: '',
  bloodPressure: '',
  hemoglobin: '',
  isAllergic: false,
  rejectionReason: '',
  lockoutUntil: '',
  deferredUntil: '',
  donationTime: new Date().toTimeString().slice(0, 5),
};

export const DONATION_TYPE_LABELS: Record<string, string> = {
  whole: 'دم كامل',
  plasma: 'بلازما',
  platelets: 'صفائح دموية',
};
