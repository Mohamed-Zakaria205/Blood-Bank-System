// ═══════════════════════════════════════════════════════════
// Lab API service — tests, samples, results
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type { LabResultData, LabTest, Sample, TestResult } from '../types/lab';
import {
  labTests as MOCK_LAB_TESTS,
  samples as MOCK_SAMPLES,
  testResults as MOCK_TEST_RESULTS,
} from '../data/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/** In-memory stores so mutations persist across refetches */
let mockLabTests: LabTest[] = [...MOCK_LAB_TESTS];
let mockSamples: Sample[] = [...MOCK_SAMPLES];
let mockTestResults: TestResult[] = [...MOCK_TEST_RESULTS];

// ── Lab Tests (blood bag screening) ────────────────────────
export async function fetchLabTests(): Promise<LabTest[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return mockLabTests;
  }
  const { data } = await apiClient.get<LabTest[]>('/lab/tests');
  return data;
}

export async function submitLabTestResult(
  testId: string,
  result: LabResultData & {
    notes: string;
    suitable: boolean;
  },
): Promise<LabTest> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600));
    const idx = mockLabTests.findIndex((t) => t.id === testId);
    if (idx === -1) throw { response: { status: 404, data: { message: 'الفحص غير موجود' } } };
    const updated: LabTest = {
      ...mockLabTests[idx],
      status: 'completed' as const,
      result: {
        ...result,
        completedAt: new Date().toLocaleString('ar-EG'),
        completedBy: 'current-user',
      },
    };
    // ✅ Mutate the in-memory array so refetch returns the updated test
    mockLabTests = mockLabTests.map((t) => (t.id === testId ? updated : t));
    return updated;
  }
  const { data } = await apiClient.post<LabTest>(`/lab/tests/${testId}/result`, result);
  return data;
}

// ── Samples ────────────────────────────────────────────────
export async function fetchSamples(): Promise<Sample[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return mockSamples;
  }
  const { data } = await apiClient.get<Sample[]>('/lab/samples');
  return data;
}

// ── Test Results ───────────────────────────────────────────
export async function fetchTestResults(): Promise<TestResult[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return mockTestResults;
  }
  const { data } = await apiClient.get<TestResult[]>('/lab/results');
  return data;
}
