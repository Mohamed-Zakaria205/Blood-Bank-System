// ═══════════════════════════════════════════════════════════
// Lab types — tests, samples, results
// ═══════════════════════════════════════════════════════════
import type { BloodType, DonationType } from './common';

export interface LabResultData {
  confirmedBloodType: BloodType;
  hcv: 'negative' | 'positive';
  hbv: 'negative' | 'positive';
  syphilis: 'negative' | 'positive';
  hiv: 'negative' | 'positive';
}

export interface LabTestResult extends LabResultData {
  outcome: 'safe' | 'rejected';
  notes: string;
  completedAt: string;
  completedById: string;
  completedByName: string;
}

export interface LabTest {
  id: string;
  donorId: string;
  donorName: string;
  donationCode: string;
  bloodType: BloodType;
  donationType: DonationType;
  city: string;
  requestedAt: string;
  status: 'pending' | 'completed';
  result?: LabTestResult;
}

export interface Sample {
  id: string;
  donationCode: string;
  donorName: string;
  bloodType: BloodType;
  donationType: DonationType;
  collectedDate: string;
  status: 'pending' | 'testing' | 'completed';
  labDoctor?: string;
  city?: string;
  nationalId?: string;
}

export interface TestResult {
  id: string;
  sampleId: string;
  donationCode: string;
  donorName: string;
  bloodType: BloodType;
  confirmedBloodType: BloodType;
  hcv: 'negative' | 'positive';
  hbv: 'negative' | 'positive';
  syphilis: 'negative' | 'positive';
  hiv: 'negative' | 'positive';
  outcome: 'safe' | 'rejected';
  labDoctor: string;
  date: string;
  notes?: string;
  nationalId?: string;
}

export interface LabDashboardStats {
  tests: {
    pending: number;
    completed: number;
  };
  results: {
    total: number;
    safe: number;
    rejected: number;
  };
}
