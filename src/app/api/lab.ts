// ═══════════════════════════════════════════════════════════
// Lab API service — tests, samples, results
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type { LabResultData, LabTest, Sample, TestResult } from '../types/lab';
import type { PaginatedResponse, ApiResponse, LabTestFilters } from '../types/common';
import {
  labTests as MOCK_LAB_TESTS,
  samples as MOCK_SAMPLES,
  testResults as MOCK_TEST_RESULTS,
} from '../data/lab.mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/** In-memory stores so mutations persist across refetches */
let mockLabTests: LabTest[] = [...MOCK_LAB_TESTS];
let mockSamples: Sample[] = [...MOCK_SAMPLES];
let mockTestResults: TestResult[] = [...MOCK_TEST_RESULTS];

// ── Lab Tests (blood bag screening) ────────────────────────
export async function fetchLabTests(): Promise<PaginatedResponse<LabTest>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return { data: mockLabTests, total: mockLabTests.length, page: 1, limit: mockLabTests.length };
  }
  const { data } = await apiClient.get<PaginatedResponse<LabTest>>('/lab/tests');
  return data;
}

/**
 * Fetch lab tests with filtering and pagination.
 * Mock: client-side filter + slice. Real API: forwarded as query-string.
 */
export async function fetchFilteredLabTests(
  filters: LabTestFilters = {},
): Promise<PaginatedResponse<LabTest>> {
  const { page = 1, limit = 10, search = '', status = '', bloodType = '' } = filters;

  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));

    let result = mockLabTests;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) => t.donorName.toLowerCase().includes(q) || t.donorCode.toLowerCase().includes(q),
      );
    }
    if (status)    result = result.filter((t) => t.status === status);
    if (bloodType) result = result.filter((t) => t.bloodType === bloodType);

    const total = result.length;
    const data  = result.slice((page - 1) * limit, page * limit);
    return { data, total, page, limit };
  }

  const { data } = await apiClient.get<PaginatedResponse<LabTest>>('/lab/tests', {
    params: { page, limit, search, status, bloodType },
  });
  return data;
}

export async function submitLabTestResult(
  testId: string,
  result: LabResultData & {
    notes: string;
    suitable: boolean;
  },
): Promise<ApiResponse<LabTest>> {
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
    return { data: updated, message: 'تم حفظ نتيجة الفحص بنجاح' };
  }
  const { data } = await apiClient.post<ApiResponse<LabTest>>(`/lab/tests/${testId}/result`, result);
  return data;
}

// ── Samples ────────────────────────────────────────────────
export async function fetchSamples(): Promise<PaginatedResponse<Sample>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return { data: mockSamples, total: mockSamples.length, page: 1, limit: mockSamples.length };
  }
  const { data } = await apiClient.get<PaginatedResponse<Sample>>('/lab/samples');
  return data;
}

// ── Test Results ───────────────────────────────────────────
export async function fetchTestResults(): Promise<PaginatedResponse<TestResult>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return { data: mockTestResults, total: mockTestResults.length, page: 1, limit: mockTestResults.length };
  }
  const { data } = await apiClient.get<PaginatedResponse<TestResult>>('/lab/results');
  return data;
}
