import { type Dispatch, type SetStateAction, useCallback } from 'react';

/**
 * Returns a strongly-typed filter-change handler that:
 *  1. Updates the filter value via the provided setter.
 *  2. Automatically resets pagination to page 1 so the user never
 *     ends up on a non-existent page after narrowing a filter.
 *
 * Usage:
 *   const { handleFilterChange } = useFilterChange(setPage);
 *   <input onChange={(e) => handleFilterChange(setSearch, e.target.value)} />
 */
export function useFilterChange(setPage: Dispatch<SetStateAction<number>>) {
  const handleFilterChange = useCallback(
    <T>(setter: Dispatch<SetStateAction<T>>, value: T): void => {
      setter(value);
      setPage(1);
    },
    [setPage],
  );

  return { handleFilterChange };
}
