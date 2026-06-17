// ═══════════════════════════════════════════════════════════
// Lab API service — tests, samples, results
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type { LabResultData, LabTest, Sample, TestResult, LabDashboardStats } from '../types/lab';
import type {
  PaginatedResponse,
  ApiResponse,
  LabTestFilters,
  SampleFilters,
  ResultFilters,
} from '../types/common';
import { validateContract, createPaginatedSchema, LabTestContractSchema } from './contract';
import type { ApiResponseWrapper } from '../types/auth';

const labBaseURL = apiClient.defaults.baseURL?.replace('/system', '') ?? '/api/v1';

function mapRawLabTest(item: any): LabTest {
  if (!item) return item;
  return {
    ...item,
    status: item.status?.toLowerCase() as 'pending' | 'completed',
    result: item.result
      ? {
          ...item.result,
          outcome: item.result.outcome?.toLowerCase() as 'safe' | 'rejected',
          hcv: item.result.hcv?.toLowerCase() as 'negative' | 'positive',
          hbv: item.result.hbv?.toLowerCase() as 'negative' | 'positive',
          syphilis: item.result.syphilis?.toLowerCase() as 'negative' | 'positive',
          hiv: item.result.hiv?.toLowerCase() as 'negative' | 'positive',
        }
      : null,
  };
}

function mapRawSample(item: any): Sample {
  if (!item) return item;
  return {
    ...item,
    status: item.status?.toLowerCase() as 'pending' | 'testing' | 'completed',
    nationalId:
      item.nationalId || item.national_id || item.donorNationalId || item.NationalId || '',
  };
}

function mapRawTestResult(item: any): TestResult {
  if (!item) return item;
  return {
    ...item,
    hcv: item.hcv?.toLowerCase() as 'negative' | 'positive',
    hbv: item.hbv?.toLowerCase() as 'negative' | 'positive',
    syphilis: item.syphilis?.toLowerCase() as 'negative' | 'positive',
    hiv: item.hiv?.toLowerCase() as 'negative' | 'positive',
    outcome: item.outcome?.toLowerCase() as 'safe' | 'rejected',
    nationalId:
      item.nationalId || item.national_id || item.donorNationalId || item.NationalId || '',
  };
}

// ── Lab Tests (blood bag screening) ────────────────────────
export async function fetchLabTests(): Promise<PaginatedResponse<LabTest>> {
  const { data: wrapper } = await apiClient.get<
    ApiResponseWrapper<{
      items?: LabTest[];
      total: number;
      page: number;
      limit: number;
    }>
  >('/lab/tests', { baseURL: labBaseURL });

  const rawItems = wrapper.data?.items || [];
  const data = rawItems.map(mapRawLabTest);
  const total = wrapper.data?.total ?? data.length;
  const page = wrapper.data?.page ?? 1;
  const limit = wrapper.data?.limit ?? data.length;

  const result = { data, total, page, limit };
  validateContract('Lab Tests', createPaginatedSchema(LabTestContractSchema), result);
  return result;
}

/**
 * Fetch lab tests with filtering and pagination.
 */
export async function fetchFilteredLabTests(
  filters: LabTestFilters = {},
  options?: { signal?: AbortSignal },
): Promise<PaginatedResponse<LabTest>> {
  const { page = 1, limit = 10, search = '', status = '', bloodType = '' } = filters;

  const { data: wrapper } = await apiClient.get<
    ApiResponseWrapper<{
      items?: LabTest[];
      total: number;
      page: number;
      limit: number;
    }>
  >('/lab/tests', {
    baseURL: labBaseURL,
    params: { page, limit, search, status, bloodType },
    signal: options?.signal,
  });

  const rawItems = wrapper.data?.items || [];
  const data = rawItems.map(mapRawLabTest);
  const total = wrapper.data?.total ?? 0;
  const returnedPage = wrapper.data?.page ?? page;
  const returnedLimit = wrapper.data?.limit ?? limit;

  const result = { data, total, page: returnedPage, limit: returnedLimit };
  validateContract('Paginated Lab Tests', createPaginatedSchema(LabTestContractSchema), result);
  return result;
}

export async function submitLabTestResult(
  testId: string,
  result: LabResultData & {
    notes: string;
  },
): Promise<ApiResponse<LabTest>> {
  const { data: wrapper } = await apiClient.post<ApiResponseWrapper<LabTest>>(
    `/lab/tests/${testId}/result`,
    result,
    { baseURL: labBaseURL },
  );
  return {
    data: mapRawLabTest(wrapper.data),
    message: wrapper.message,
  };
}

// ── Samples ────────────────────────────────────────────────
export async function fetchSamples(
  filters: SampleFilters = {},
): Promise<PaginatedResponse<Sample>> {
  const { page = 1, limit = 100, search = '', status = '', bloodType = '' } = filters;
  const params = Object.fromEntries(
    Object.entries({ page, limit, search, status, bloodType }).filter(
      ([_, v]) => v !== '' && v !== null && v !== undefined,
    ),
  );
  const { data: wrapper } = await apiClient.get<
    ApiResponseWrapper<{
      items?: Sample[];
      total: number;
      page: number;
      limit: number;
    }>
  >('/lab/samples', {
    baseURL: labBaseURL,
    params,
  });

  const rawItems = wrapper.data?.items || [];
  const data = rawItems.map(mapRawSample);
  const total = wrapper.data?.total ?? 0;
  const returnedPage = wrapper.data?.page ?? page;
  const returnedLimit = wrapper.data?.limit ?? limit;

  return { data, total, page: returnedPage, limit: returnedLimit };
}

// ── Test Results ───────────────────────────────────────────
export async function fetchTestResults(
  filters: ResultFilters = {},
): Promise<PaginatedResponse<TestResult>> {
  const {
    page = 1,
    limit = 100,
    search = '',
    bloodType = '',
    outcome: outcomeFilter = '',
  } = filters;
  const params = Object.fromEntries(
    Object.entries({ page, limit, search, bloodType, outcome: outcomeFilter }).filter(
      ([_, v]) => v !== '' && v !== null && v !== undefined,
    ),
  );
  const { data: wrapper } = await apiClient.get<
    ApiResponseWrapper<{
      items?: TestResult[];
      total: number;
      page: number;
      limit: number;
    }>
  >('/lab/results', {
    baseURL: labBaseURL,
    params,
  });

  const rawItems = wrapper.data?.items || [];
  const data = rawItems.map(mapRawTestResult);
  const total = wrapper.data?.total ?? 0;
  const returnedPage = wrapper.data?.page ?? page;
  const returnedLimit = wrapper.data?.limit ?? limit;

  return { data, total, page: returnedPage, limit: returnedLimit };
}

// ── Dashboard Statistics ────────────────────────────────────
export async function fetchLabDashboardStats(): Promise<LabDashboardStats> {
  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<LabDashboardStats>>(
    '/lab/dashboard/stats',
    {
      baseURL: labBaseURL,
    },
  );

  return wrapper.data!;
}
