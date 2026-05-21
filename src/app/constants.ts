import { BENI_SUEF_CITIES } from './data/cities';
import type { BloodType } from './types';

export const CITIES = BENI_SUEF_CITIES.map((city) => city.city_name_ar);


export const DISEASES = [
  { id: 'hypertension', label: 'ضغط الدم المرتفع' },
  { id: 'diabetes', label: 'السكري' },
  { id: 'heart', label: 'أمراض القلب' },
  { id: 'asthma', label: 'الربو' },
  { id: 'liver', label: 'أمراض الكبد' },
  { id: 'kidney', label: 'أمراض الكلى' },
  { id: 'epilepsy', label: 'الصرع' },
  { id: 'anemia', label: 'فقر الدم' },
];

export const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
