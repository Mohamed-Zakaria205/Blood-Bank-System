import { describe, it, expect } from 'vitest';
import {
  toISODateTime,
  toISODate,
  formatLocalizedDate,
  formatLocalizedDateTime,
} from './date';

describe('toISODateTime', () => {
  it('should format a valid date, string, or number to ISO 8601', () => {
    const date = new Date('2026-05-11T12:00:00Z');
    expect(toISODateTime(date)).toBe('2026-05-11T12:00:00.000Z');
    expect(toISODateTime('2026-05-11T12:00:00Z')).toBe('2026-05-11T12:00:00.000Z');
  });

  it('should return empty string for falsy or invalid input', () => {
    expect(toISODateTime('')).toBe('');
    expect(toISODateTime(null as any)).toBe('');
    expect(toISODateTime('invalid-date')).toBe('');
  });
});

describe('toISODate', () => {
  it('should format a valid date/string/number to YYYY-MM-DD format', () => {
    const date = new Date('2026-05-11T12:00:00Z');
    expect(toISODate(date)).toBe('2026-05-11');
    expect(toISODate('2026-05-11')).toBe('2026-05-11');
  });

  it('should return empty string for falsy or invalid input', () => {
    expect(toISODate('')).toBe('');
    expect(toISODate(null as any)).toBe('');
    expect(toISODate('invalid-date')).toBe('');
  });
});

describe('formatLocalizedDate', () => {
  it('should format a date to Egyptian Arabic localized string containing the Arabic month name', () => {
    const date = new Date('2026-05-11T00:00:00');
    const result = formatLocalizedDate(date);

    // The month for May (05) in Arabic is "مايو"
    expect(result).toContain('مايو');

    // The year 2026 should be present either in Arabic numerals (٢٠٢٦) or Western numerals (2026)
    const hasArabicYear = result.includes('٢٠٢٦');
    const hasWesternYear = result.includes('2026');
    expect(hasArabicYear || hasWesternYear).toBe(true);
  });

  it('should return empty string for invalid date inputs', () => {
    expect(formatLocalizedDate('')).toBe('');
    expect(formatLocalizedDate('invalid-date')).toBe('');
  });
});

describe('formatLocalizedDateTime', () => {
  it('should format a datetime to Egyptian Arabic localized string with month and time indicators', () => {
    const date = new Date('2026-05-11T14:30:00');
    const result = formatLocalizedDateTime(date);

    expect(result).toContain('مايو');

    // Check for minutes
    const hasArabicMinutes = result.includes('٣٠') || result.includes('30');
    expect(hasArabicMinutes).toBe(true);
  });

  it('should return empty string for invalid datetime inputs', () => {
    expect(formatLocalizedDateTime('')).toBe('');
    expect(formatLocalizedDateTime('invalid-date')).toBe('');
  });
});
