// ── Shared types and constants for Lab module ──

export type TestKey = 'hcv' | 'hbv' | 'syphilis' | 'hiv';

export interface ScreeningForm {
  confirmedBloodType: string;
  hcv: 'negative' | 'positive';
  hbv: 'negative' | 'positive';
  syphilis: 'negative' | 'positive';
  hiv: 'negative' | 'positive';
  notes: string;
}

export const screeningTests: {
  key: TestKey;
  label: string;
  abbr: string;
  desc: string;
}[] = [
  {
    key: 'hcv',
    label: 'التهاب الكبد الوبائي C',
    abbr: 'HCV',
    desc: 'Hepatitis C Virus',
  },
  {
    key: 'hbv',
    label: 'التهاب الكبد الوبائي B',
    abbr: 'HBV',
    desc: 'Hepatitis B Virus',
  },
  {
    key: 'syphilis',
    label: 'مرض الزهري',
    abbr: 'Syphilis',
    desc: 'Treponema Pallidum',
  },
  {
    key: 'hiv',
    label: 'فيروس نقص المناعة البشري',
    abbr: 'HIV',
    desc: 'Human Immunodeficiency Virus (AIDS)',
  },
];

export const donationTypeLabels: Record<string, string> = {
  whole: 'دم كامل',
  plasma: 'بلازما',
  platelets: 'صفائح',
};

export const defaultScreeningForm = (bloodType: string): ScreeningForm => ({
  confirmedBloodType: bloodType,
  hcv: 'negative',
  hbv: 'negative',
  syphilis: 'negative',
  hiv: 'negative',
  notes: '',
});
