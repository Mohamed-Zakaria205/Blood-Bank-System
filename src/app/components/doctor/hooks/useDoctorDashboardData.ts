import { useQuery } from '@tanstack/react-query';
import { fetchDoctorDashboardData } from '../../../api/doctor';

export function useDoctorDashboardData() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['doctor-dashboard-data'],
    queryFn: fetchDoctorDashboardData,
    staleTime: 5 * 60 * 1000,       // 5 minutes — dashboard stats don't need real-time updates
    refetchOnWindowFocus: false,      // avoid refetch on every tab switch
    retry: false,                     // 500 is a server error — retrying won't help
  });

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
  };
}
