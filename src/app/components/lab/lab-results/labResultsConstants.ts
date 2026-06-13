// ── Shared constants, helpers and types for LabResults module ──
import type { TestResult, Sample } from '../../../types/lab';
import type { Donor } from '../../../types/donor';

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

// ── Build combined list (pending samples + completed results) ──
export function buildCombinedList(
  testResults: TestResult[],
  samplesData: Sample[],
  donorsData: Donor[],
) {
  function getDonorNationalId(donationCode: string): string {
    const donor = donorsData.find((d) => d.donorCode === donationCode);
    return donor?.nationalId || '—';
  }

  const completed = testResults.map((r) => ({
    id: r.id,
    sampleId: r.sampleId,
    sampleCode: r.donationCode,
    donorCode: r.donationCode,
    donationCode: r.donationCode,
    donorName: r.donorName,
    nationalId: getDonorNationalId(r.donationCode),
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

  const completedSampleIds = new Set(completed.map((r) => r.sampleId));
  const pendingEntries = samplesData
    .filter((s) => !completedSampleIds.has(s.id))
    .map((s) => ({
      id: `PENDING-${s.id}`,
      sampleId: s.id,
      sampleCode: s.donationCode,
      donorCode: s.donationCode,
      donationCode: s.donationCode,
      donorName: s.donorName,
      nationalId: getDonorNationalId(s.donationCode),
      bloodType: s.bloodType,
      confirmedBloodType: null,
      hcv: null,
      hbv: null,
      syphilis: null,
      hiv: null,
      outcome: 'pending',
      labDoctor: s.labDoctor || '—',
      date: s.collectedDate,
      notes: undefined as string | undefined,
      displayStatus: 'pending',
    }));

  return [...pendingEntries, ...completed].sort((a) => (a.displayStatus === 'pending' ? -1 : 1));
}

export type CombinedEntry = ReturnType<typeof buildCombinedList>[0];
