import apiClient from './client';
import type { ApiResponseWrapper } from '../types/auth';
import type { PaginatedResponse } from '../types/common';
import type {
  BloodDemand,
  BloodDemandDetail,
  CreateBloodDemandRequest,
  BloodDemandFilters,
  BloodDemandDashboardStats,
} from '../types/bloodDemands';
import {
  validateContract,
  BloodDemandContractSchema,
  BloodDemandDetailContractSchema,
  BloodDemandDashboardStatsSchema,
} from './contract';

export async function fetchBloodDemands(
  filters: BloodDemandFilters = {},
  options?: { signal?: AbortSignal },
): Promise<PaginatedResponse<BloodDemand>> {
  const { page = 1, limit = 10, search = '', status = '', bloodType = '', priority = '' } = filters;

  const params: Record<string, string | number | boolean | undefined> = {
    page,
    limit,
  };
  if (search) params.search = search;
  if (status) params.status = status;
  if (bloodType) params.bloodType = bloodType;
  if (priority) params.priority = priority;

  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<{
    items?: BloodDemand[];
    data?: BloodDemand[];
    totalCount?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  }>>('/blood-demands', {
    params,
    signal: options?.signal,
  });

  const items = wrapper.data?.items || wrapper.data?.data || [];
  
  if (import.meta.env.DEV && items.length > 0) {
    items.forEach((item) => {
      validateContract('Blood Demand Item', BloodDemandContractSchema, item);
    });
  }

  return {
    data: items,
    total: wrapper.data?.totalCount ?? items.length,
    page: wrapper.data?.page ?? page,
    limit: wrapper.data?.limit ?? limit,
    totalPages: wrapper.data?.totalPages,
    hasNextPage: wrapper.data?.hasNextPage,
    hasPreviousPage: wrapper.data?.hasPreviousPage,
  };
}

export async function fetchBloodDemandDetail(
  id: string,
  options?: { signal?: AbortSignal },
): Promise<BloodDemandDetail> {
  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<BloodDemandDetail>>(`/blood-demands/${id}`, {
    signal: options?.signal,
  });
  
  validateContract('Blood Demand Detail', BloodDemandDetailContractSchema, wrapper.data);
  return wrapper.data;
}

export async function createBloodDemand(
  payload: CreateBloodDemandRequest,
): Promise<string> {
  const { data: wrapper } = await apiClient.post<ApiResponseWrapper<string>>('/blood-demands', payload);
  return wrapper.data;
}

export async function fetchBloodDemandDashboard(): Promise<BloodDemandDashboardStats> {
  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<BloodDemandDashboardStats>>(
    '/blood-demands/dashboard',
  );

  validateContract('Blood Demand Dashboard', BloodDemandDashboardStatsSchema, wrapper.data);
  return wrapper.data;
}

export async function cancelBloodDemand(id: string): Promise<void> {
  await apiClient.post(`/blood-demands/${id}/cancel`);
}

