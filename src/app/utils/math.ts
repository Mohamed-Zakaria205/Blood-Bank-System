/**
 * Calculates progress percentage of current count against target count.
 * Returns an integer between 0 and 100.
 */
export function calculateProgressPercentage(current: number, target: number): number {
  if (isNaN(target) || target <= 0) return 0;
  if (isNaN(current) || current <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}
