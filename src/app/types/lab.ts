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
  notes: string;
  suitable: boolean;
  completedAt: string;
  completedBy: string;
}

export interface LabTest {
  id: string;
  donorId: string;
  donorName: string;
  donorCode: string;
  bloodType: BloodType;
  donationType: DonationType;
  city: string;
  requestedAt: string;
  status: 'pending' | 'completed' | 'cancelled';
  result?: LabTestResult;
}

export interface Sample {
  id: string;
  donorCode: string;
  donorName: string;
  bloodType: BloodType;
  donationType: DonationType;
  collectedDate: string;
  status: 'pending' | 'testing' | 'completed';
  priority: 'normal' | 'urgent';
  labDoctor?: string;
  city?: string;
}

export interface TestResult {
  id: string;
  sampleId: string;
  donorCode: string;
  donorName: string;
  bloodType: BloodType;
  confirmedBloodType: BloodType;
  hcv: 'negative' | 'positive';
  hbv: 'negative' | 'positive';
  syphilis: 'negative' | 'positive';
  hiv: 'negative' | 'positive';
  result: 'safe' | 'unsafe';
  labDoctor: string;
  date: string;
  notes?: string;
}
