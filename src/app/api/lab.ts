// ═══════════════════════════════════════════════════════════
// Lab API service — tests, samples, results
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type { LabTest, Sample, TestResult } from '../types/lab';
import {
  labTests as MOCK_LAB_TESTS,
  samples as MOCK_SAMPLES,
  testResults as MOCK_TEST_RESULTS,
} from '../data/mockData';

const USE_MOCK = true;

// ── Lab Tests (blood bag screening) ────────────────────────
export async function fetchLabTests(): Promise<LabTest[]> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    return MOCK_LAB_TESTS;
  }
  const { data } = await apiClient.get<LabTest[]>('/lab/tests');
  return data;
}

export async function submitLabTestResult(testId: string, result: {
  confirmedBloodType: string;
  hcv: 'negative' | 'positive';
  hbv: 'negative' | 'positive';
  syphilis: 'negative' | 'positive';
  hiv: 'negative' | 'positive';
  notes: string;
  suitable: boolean;
}): Promise<LabTest> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 600));
    const test = MOCK_LAB_TESTS.find(t => t.id === testId);
    if (!test) throw { response: { status: 404, data: { message: 'الفحص غير موجود' } } };
    return {
      ...test,
      status: 'completed' as const,
      result: {
        ...result,
        confirmedBloodType: result.confirmedBloodType as any,
        completedAt: new Date().toLocaleString('ar-EG'),
        completedBy: 'current-user',
      },
    };
  }
  const { data } = await apiClient.post<LabTest>(`/lab/tests/${testId}/result`, result);
  return data;
}

// ── Samples ────────────────────────────────────────────────
export async function fetchSamples(): Promise<Sample[]> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    return MOCK_SAMPLES;
  }
  const { data } = await apiClient.get<Sample[]>('/lab/samples');
  return data;
}

// ── Test Results ───────────────────────────────────────────
export async function fetchTestResults(): Promise<TestResult[]> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    return MOCK_TEST_RESULTS;
  }
  const { data } = await apiClient.get<TestResult[]>('/lab/results');
  return data;
}
