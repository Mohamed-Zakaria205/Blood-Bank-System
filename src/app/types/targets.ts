import type { BloodType } from './common';

export interface WeeklyBloodTypeTarget {
  bloodType: BloodType;
  targetCount: number;
  currentDonationsCount?: number;
}

export interface WeeklyTargetsUpdatePayload {
  bloodType: BloodType;
  targetCount: number;
}
