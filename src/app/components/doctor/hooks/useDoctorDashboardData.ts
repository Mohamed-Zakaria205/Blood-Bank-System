import { useQuery } from '@tanstack/react-query';
import { fetchDoctorDashboardData } from '../../../api/doctor';

export function useDoctorDashboardData() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['doctor-dashboard-data'],
    queryFn: fetchDoctorDashboardData,
  });

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
}
