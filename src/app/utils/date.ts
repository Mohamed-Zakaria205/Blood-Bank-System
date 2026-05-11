/**
 * Shared Date utilities to ensure consistent serialization at API boundaries
 * and consistent display formats in the UI.
 */

/**
 * Formats a Date object or string into a strict ISO 8601 datetime string.
 * This is the standard format expected by most modern backends.
 * Example: 2026-05-11T12:00:00.000Z
 */
export function toISODateTime(date: Date | string | number): string {
  if (!date) return '';
  const d = new Date(date);
  return isNaN(d.getTime()) ? '' : d.toISOString();
}

/**
 * Formats a Date object or string into a strict YYYY-MM-DD string.
 * Useful for birth dates or pure dates without time.
 * Example: 1990-01-01
 */
export function toISODate(date: Date | string | number): string {
  if (!date) return '';
  const d = new Date(date);
  return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
}

/**
 * Formats a Date object or string into a localized Egyptian Arabic format.
 * ONLY for use in UI rendering, NEVER in API payloads.
 * Example: ١١ مايو ٢٠٢٦
 */
export function formatLocalizedDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

/**
 * Formats a Date object or string into a localized Egyptian Arabic datetime format.
 * ONLY for use in UI rendering, NEVER in API payloads.
 */
export function formatLocalizedDateTime(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
}
