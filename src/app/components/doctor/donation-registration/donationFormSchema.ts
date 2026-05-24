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
    dateOfBirth: z.string().refine((value) => {
      if (!value) return false;
      const dob = new Date(value);
      if (isNaN(dob.getTime())) return false;
      const today = new Date();
      let calculatedAge = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        calculatedAge--;
      }
      return calculatedAge >= 18 && calculatedAge <= 65;
    }, 'تاريخ الميلاد يجب أن يجعل السن بين 18 و 65 سنة'),
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
    donationCenterId: z.string(),
    status: z.enum(['eligible', 'ineligible', 'deferred']),
    weight: z.string().min(1, 'أدخل الوزن').refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'أدخل وزناً صحيحاً'),
    bloodPressure: z.string().min(1, 'أدخل ضغط الدم'),
    hemoglobin: z.string().min(1, 'أدخل الهيموجلوبين').refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'أدخل قيمة صحيحة'),
    isAllergic: z.boolean(),
    rejectionReason: z.string(),
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
    if (data.source === 'walkin' && !data.donationCenterId.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'اختر مركز التبرع',
        path: ['donationCenterId'],
      });
    }
  });

export type SimpleForm = z.infer<typeof donorSchema>;


export const initialForm: SimpleForm = {
  name: '',
  gender: '',
  dateOfBirth: '',
  phone: '',
  nationalId: '',
  governorate: 'بني سويف',
  district: 'مركز وبندر بني سويف',
  area: '',
  bloodType: '',
  donationType: 'wholeblood',
  diseases: [],
  source: 'walkin',
  campaignId: '',
  donationCenterId: '',
  status: 'eligible',
  weight: '',
  bloodPressure: '',
  hemoglobin: '',
  isAllergic: false,
  rejectionReason: '',
  deferredUntil: '',
  donationTime: new Date().toTimeString().slice(0, 5),
};

export const DONATION_TYPE_LABELS: Record<string, string> = {
  wholeblood: 'دم كامل',
  plasma: 'بلازما',
  platelets: 'صفائح دموية',
};
