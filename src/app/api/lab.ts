// ═══════════════════════════════════════════════════════════
// Lab API service — tests, samples, results
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import { ApiError } from './errors';
import type { LabResultData, LabTest, Sample, TestResult } from '../types/lab';
import type { PaginatedResponse, ApiResponse, LabTestFilters, SampleFilters, ResultFilters } from '../types/common';
import {
  labTests as MOCK_LAB_TESTS,
  samples as MOCK_SAMPLES,
  testResults as MOCK_TEST_RESULTS,
} from '../data/lab.mock';
import { validateContract, createPaginatedSchema, LabTestContractSchema } from './contract';

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
  validateContract('Lab Tests', createPaginatedSchema(LabTestContractSchema), data);
  return data;
}

/**
 * Fetch lab tests with filtering and pagination.
 * Mock: client-side filter + slice. Real API: forwarded as query-string.
 */
export async function fetchFilteredLabTests(
  filters: LabTestFilters = {},
  options?: { signal?: AbortSignal }
): Promise<PaginatedResponse<LabTest>> {
  const { page = 1, limit = 10, search = '', status = '', bloodType = '' } = filters;

  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));

    let result = mockLabTests;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) => t.donorName.toLowerCase().includes(q) || t.donationCode.toLowerCase().includes(q),
      );
    }
    if (status) result = result.filter((t) => t.status === status);
    if (bloodType) result = result.filter((t) => t.bloodType === bloodType);

    const total = result.length;
    const data  = result.slice((page - 1) * limit, page * limit);
    return { data, total, page, limit };
  }

  const { data } = await apiClient.get<PaginatedResponse<LabTest>>('/lab/tests', {
    params: { page, limit, search, status, bloodType },
    signal: options?.signal,
  });
  validateContract('Paginated Lab Tests', createPaginatedSchema(LabTestContractSchema), data);
  return data;
}

export async function submitLabTestResult(
  testId: string,
  result: LabResultData & {
    notes: string;
  },
): Promise<ApiResponse<LabTest>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600));
    const idx = mockLabTests.findIndex((t) => t.id === testId);
    if (idx === -1) throw new ApiError('الفحص غير موجود', 404);
    const isRejected =
      result.hcv === 'positive' ||
      result.hbv === 'positive' ||
      result.syphilis === 'positive' ||
      result.hiv === 'positive';
    const updated: LabTest = {
      ...mockLabTests[idx],
      status: 'completed' as const,
      result: {
        outcome: isRejected ? 'rejected' : 'safe',
        ...result,
        completedAt: new Date().toISOString(),
        completedById: 'current-user-id',
        completedByName: 'د. ياسمين حسام نور', // or user name from context if accessible, but hardcoded mock is fine
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
export async function fetchSamples(
  filters: SampleFilters = {},
): Promise<PaginatedResponse<Sample>> {
  const { page = 1, limit = 100, search = '', status = '', bloodType = '' } = filters;
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    let result = mockSamples;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.donorName.toLowerCase().includes(q) ||
          s.donationCode.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q),
      );
    }
    if (status) result = result.filter((s) => s.status === status);
    if (bloodType) result = result.filter((s) => s.bloodType === bloodType);


    const total = result.length;
    const data = result.slice((page - 1) * limit, page * limit);
    return { data, total, page, limit };
  }
  const { data } = await apiClient.get<PaginatedResponse<Sample>>('/lab/samples', {
    params: { page, limit, search, status, bloodType },
  });
  return data;
}

// ── Test Results ───────────────────────────────────────────
export async function fetchTestResults(
  filters: ResultFilters = {},
): Promise<PaginatedResponse<TestResult>> {
  const { page = 1, limit = 100, search = '', bloodType = '', outcome: outcomeFilter = '' } = filters;
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    let result = mockTestResults;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.donorName.toLowerCase().includes(q) ||
          r.donationCode.toLowerCase().includes(q) ||
          r.sampleId.toLowerCase().includes(q),
      );
    }
    if (bloodType) result = result.filter((r) => r.bloodType === bloodType);
    if (outcomeFilter) {
      result = result.filter((r) => r.outcome === outcomeFilter);
    }
    const total = result.length;
    const data = result.slice((page - 1) * limit, page * limit);
    return { data, total, page, limit };
  }
  const { data } = await apiClient.get<PaginatedResponse<TestResult>>('/lab/results', {
    params: { page, limit, search, bloodType, outcome: outcomeFilter },
  });
  return data;
}
