import type { TestResult } from '../../../types/lab';
/** 4 standard screening tests */
export const SCREENING_TESTS = [
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
    label: 'فيروس نقص المناعة',
    abbr: 'HIV',
    desc: 'Human Immunodeficiency Virus (AIDS)',
  },
] as const;

// ── Build results list ──
export function buildResultsList(testResults: TestResult[]) {
  const completed = testResults.map((r) => ({
    id: r.id,
    sampleId: r.sampleId,
    sampleCode: r.donationCode,
    donorCode: r.donationCode,
    donationCode: r.donationCode,
    donorName: r.donorName,
    nationalId: r.nationalId || '—',
    bloodType: r.bloodType,
    confirmedBloodType: r.confirmedBloodType,
    hcv: r.hcv,
    hbv: r.hbv,
    syphilis: r.syphilis,
    hiv: r.hiv,
    outcome: r.outcome as 'safe' | 'rejected',
    labDoctor: r.labDoctor,
    date: r.date,
    notes: r.notes,
    displayStatus: r.outcome === 'safe' ? 'safe' : 'rejected',
  }));

  return completed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export type ResultEntry = ReturnType<typeof buildResultsList>[0];
