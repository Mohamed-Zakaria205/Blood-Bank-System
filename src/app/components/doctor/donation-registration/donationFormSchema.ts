import { z } from 'zod';

const isValidEgyptianNationalId = (id: string) => {
  if (!/^\d{14}$/.test(id)) return false;
  const century = id.charAt(0);
  if (century !== '2' && century !== '3') return false;
  const year = parseInt(century === '2' ? '19' : '20') * 100 + parseInt(id.substring(1, 3));
  const month = parseInt(id.substring(3, 5));
  const day = parseInt(id.substring(5, 7));
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  const dob = new Date(year, month - 1, day);
  if (dob.getFullYear() !== year || dob.getMonth() !== month - 1 || dob.getDate() !== day) {
    return false;
  }
  return true;
};

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
    phone: z.string().regex(/^01[0125]\d{8}$/, 'رقم الهاتف غير صحيح، يجب أن يتكون من 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015'),
    nationalId: z.string().refine(isValidEgyptianNationalId, 'الرقم القومي غير صحيح أو غير متطابق مع تاريخ الميلاد'),
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
    weight: z.string().min(1, 'أدخل الوزن').refine((v) => !isNaN(Number(v)) && Number(v) >= 45 && Number(v) <= 200, 'الوزن يجب أن يكون بين 45 و 200 كجم'),
    bloodPressure: z.string().min(1, 'أدخل ضغط الدم').regex(/^\d{2,3}\/\d{2,3}$/, 'يجب إدخال ضغط الدم بصيغة صحيحة (مثل 120/80)'),
    hemoglobin: z.string().min(1, 'أدخل الهيموجلوبين').refine((v) => !isNaN(Number(v)) && Number(v) >= 7 && Number(v) <= 20, 'الهيموجلوبين يجب أن يكون بين 7 و 20 g/dL'),
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
