import { describe, it, expect } from 'vitest';
import { buildCombinedList } from './labResultsConstants';
import type { TestResult, Sample } from '../../../types/lab';
import type { Donor } from '../../../types/donor';

const mockDonors: Donor[] = [
  {
    id: 'donor1',
    donorCode: 'DN-123',
    name: 'John Doe',
    nationalId: '29901011234567',
    phone: '01000000000',
    bloodType: 'A+',
    gender: 'male',
    dateOfBirth: '1999-01-01',
    status: 'eligible',
    donations: 1,
    registeredAt: '2024-01-01',
    age: 25,
    address: '123 Main St',
    district: 'Downtown',
  },
  {
    id: 'donor2',
    donorCode: 'DN-456',
    name: 'Jane Smith',
    nationalId: '29801011234567',
    phone: '01100000000',
    bloodType: 'O-',
    gender: 'female',
    dateOfBirth: '1998-01-01',
    status: 'eligible',
    donations: 0,
    registeredAt: '2024-01-02',
    age: 26,
    address: '456 Side St',
    district: 'Uptown',
  }
];

const mockSamples: Sample[] = [
  {
    id: 'sample1',
    donationCode: 'DN-123',
    donorName: 'John Doe',
    bloodType: 'A+',
    donationType: 'wholeblood',
    collectedDate: '2024-05-30',
    status: 'pending',
    labDoctor: 'Dr. Lab',
  },
  {
    id: 'sample2',
    donationCode: 'DN-456',
    donorName: 'Jane Smith',
    bloodType: 'O-',
    donationType: 'plasma',
    collectedDate: '2024-05-31',
    status: 'pending',
  }
];

const mockTestResults: TestResult[] = [
  {
    id: 'tr1',
    sampleId: 'sample1',
    donationCode: 'DN-123',
    donorName: 'John Doe',
    bloodType: 'A+',
    confirmedBloodType: 'A+',
    hcv: 'negative',
    hbv: 'negative',
    syphilis: 'negative',
    hiv: 'negative',
    outcome: 'safe',
    date: '2024-05-30',
    labDoctor: 'Dr. Lab',
  }
];

describe('buildCombinedList', () => {
  it('correctly extracts National ID for completed results', () => {
    const list = buildCombinedList(mockTestResults, mockSamples, mockDonors);
    const completed = list.find(r => r.id === 'tr1');
    expect(completed).toBeDefined();
    expect(completed?.nationalId).toBe('29901011234567');
  });

  it('filters out completed samples from the pending list', () => {
    const list = buildCombinedList(mockTestResults, mockSamples, mockDonors);
    const pendingSample1 = list.find(r => r.sampleId === 'sample1' && r.displayStatus === 'pending');
    expect(pendingSample1).toBeUndefined(); // sample1 has a completed testResult, so it should not be pending
  });

  it('properly maps pending samples', () => {
    const list = buildCombinedList(mockTestResults, mockSamples, mockDonors);
    const pendingSample2 = list.find(r => r.sampleId === 'sample2');
    expect(pendingSample2).toBeDefined();
    expect(pendingSample2?.displayStatus).toBe('pending');
    expect(pendingSample2?.nationalId).toBe('29801011234567'); // from mockDonors
    expect(pendingSample2?.labDoctor).toBe('—'); // fallback since it's not defined
  });

  it('sorts pending items before completed items', () => {
    const list = buildCombinedList(mockTestResults, mockSamples, mockDonors);
    expect(list.length).toBe(2);
    expect(list[0].displayStatus).toBe('pending'); // sample2 should be first
    expect(list[1].displayStatus).toBe('safe'); // testResult for sample1 should be second
  });
});
