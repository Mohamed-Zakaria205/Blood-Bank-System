import { describe, it, expect } from 'vitest';
import { extractDobFromNationalId, normalizeDateToISO } from './dateUtils';

describe('extractDobFromNationalId', () => {
  it('should extract DOB from valid 1900s national ID', () => {
    // 2 (century 19) + 99 (year) + 05 (month) + 15 (day)
    expect(extractDobFromNationalId('29905151234567')).toBe('1999-05-15');
  });

  it('should extract DOB from valid 2000s national ID', () => {
    // 3 (century 20) + 05 (year) + 12 (month) + 01 (day)
    expect(extractDobFromNationalId('30512011234567')).toBe('2005-12-01');
  });

  it('should return empty string for invalid length', () => {
    expect(extractDobFromNationalId('123')).toBe('');
    expect(extractDobFromNationalId('299051512345678')).toBe('');
  });

  it('should return empty string for impossible month/day', () => {
    // Month 13
    expect(extractDobFromNationalId('29913151234567')).toBe('');
    // Day 32
    expect(extractDobFromNationalId('29905321234567')).toBe('');
  });
});

describe('normalizeDateToISO', () => {
  it('should passthrough valid yyyy-MM-dd', () => {
    expect(normalizeDateToISO('1999-05-15')).toBe('1999-05-15');
  });

  it('should convert dd/MM/yyyy', () => {
    expect(normalizeDateToISO('15/05/1999')).toBe('1999-05-15');
  });

  it('should convert dd-MM-yyyy', () => {
    expect(normalizeDateToISO('15-05-1999')).toBe('1999-05-15');
  });

  it('should return empty string for impossible dates', () => {
    expect(normalizeDateToISO('2024-02-30')).toBe(''); // Feb 30th
    expect(normalizeDateToISO('31/04/2024')).toBe(''); // Apr 31st
  });

  it('should return empty string for null/undefined/empty', () => {
    expect(normalizeDateToISO(null)).toBe('');
    expect(normalizeDateToISO(undefined)).toBe('');
    expect(normalizeDateToISO('')).toBe('');
  });
});
