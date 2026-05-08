import { useMemo } from 'react';
import { useLabTests } from '../../../hooks/useLabTests';

export function useLabDashboardData() {
  const { data: labTestsData = [], isLoading, isError, refetch } = useLabTests();

  const derivedData = useMemo(() => {
    const pending = labTestsData.filter((t) => t.status === 'pending');
    const completed = labTestsData.filter((t) => t.status === 'completed');
    const suitableCount = completed.filter((t) => t.result?.suitable).length;
    const notSuitableCount = completed.filter((t) => !t.result?.suitable).length;

    return {
      tests: labTestsData,
      pending,
      completed,
      pendingCount: pending.length,
      completedCount: completed.length,
      suitableCount,
      notSuitableCount,
    };
  }, [labTestsData]);

  return {
    ...derivedData,
    isLoading,
    isError,
    refetch,
  };
}
