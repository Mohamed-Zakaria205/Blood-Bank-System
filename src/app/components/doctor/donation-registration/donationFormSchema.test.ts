import { describe, it, expect } from 'vitest';
import { donorSchema } from './donationFormSchema';

const getValidData = () => ({
  name: 'أحمد محمد',
  gender: 'male',
  dateOfBirth: '1995-05-15',
  phone: '01012345678',
  nationalId: '29505151234567',
  governorate: 'بني سويف',
  district: 'مركز وبندر بني سويف',
  area: 'الجزيرة',
  bloodType: 'A+',
  donationType: 'wholeblood',
  diseases: [],
  source: 'walkin' as const,
  campaignId: '',
  donationCenterId: 'center-id-123',
  status: 'eligible' as const,
  weight: '75',
  bloodPressure: '120/80',
  hemoglobin: '14.5',
  isAllergic: false,
  rejectionReason: '',
  deferredUntil: '',
  donationTime: '12:00',
});

describe('donorSchema Zod validation', () => {
  it('should pass on complete valid walkin data', () => {
    const result = donorSchema.safeParse(getValidData());
    expect(result.success).toBe(true);
  });

  describe('name validation', () => {
    it('should fail if name is empty', () => {
      const data = { ...getValidData(), name: '' };
      const result = donorSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('أدخل الاسم الثنائي على الأقل');
      }
    });

    it('should fail if name is single word', () => {
      const data = { ...getValidData(), name: 'أحمد ' };
      const result = donorSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('أدخل الاسم الثنائي على الأقل');
      }
    });

    it('should pass if name is double/triple word', () => {
      const data1 = { ...getValidData(), name: 'أحمد علي' };
      const data2 = { ...getValidData(), name: 'أحمد محمد علي' };
      expect(donorSchema.safeParse(data1).success).toBe(true);
      expect(donorSchema.safeParse(data2).success).toBe(true);
    });
  });

  describe('age validation', () => {
    it('should fail if under 18 years old', () => {
      // Assuming current year is 2026, age 16: DOB 2010-05-15
      const data = { ...getValidData(), dateOfBirth: '2010-05-15' };
      const result = donorSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('تاريخ الميلاد يجب أن يجعل السن بين 18 و 65 سنة');
      }
    });

    it('should fail if over 65 years old', () => {
      // Assuming current year is 2026, age 70: DOB 1956-05-15
      const data = { ...getValidData(), dateOfBirth: '1956-05-15' };
      const result = donorSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('تاريخ الميلاد يجب أن يجعل السن بين 18 و 65 سنة');
      }
    });

    it('should pass if exactly between 18 and 65 years old', () => {
      // Age 18: 2008-01-01
      const data18 = { ...getValidData(), dateOfBirth: '2008-01-01' };
      // Age 65: 1961-01-01
      const data65 = { ...getValidData(), dateOfBirth: '1961-01-01' };
      expect(donorSchema.safeParse(data18).success).toBe(true);
      expect(donorSchema.safeParse(data65).success).toBe(true);
    });
  });

  describe('nationalId validation', () => {
    it('should fail if not exactly 14 digits', () => {
      const dataShort = { ...getValidData(), nationalId: '1234567890123' }; // 13 digits
      const dataLong = { ...getValidData(), nationalId: '123456789012345' }; // 15 digits
      const dataAlpha = { ...getValidData(), nationalId: '1234567890123a' }; // alphanumeric
      expect(donorSchema.safeParse(dataShort).success).toBe(false);
      expect(donorSchema.safeParse(dataLong).success).toBe(false);
      expect(donorSchema.safeParse(dataAlpha).success).toBe(false);
    });

    it('should pass on exactly 14 digits', () => {
      const data = { ...getValidData(), nationalId: '30012152409876' };
      expect(donorSchema.safeParse(data).success).toBe(true);
    });
  });

  describe('phone validation', () => {
    it('should fail if phone is less than 11 characters', () => {
      const data = { ...getValidData(), phone: '0101234567' }; // 10 characters
      const result = donorSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('رقم هاتف غير صحيح');
      }
    });
  });

  describe('conditional source validation', () => {
    it('should require donationCenterId when source is walkin', () => {
      const data = { ...getValidData(), source: 'walkin' as const, donationCenterId: '' };
      const result = donorSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const centerIssue = result.error.issues.find(issue => issue.path.includes('donationCenterId'));
        expect(centerIssue).toBeDefined();
        expect(centerIssue?.message).toBe('اختر مركز التبرع');
      }
    });

    it('should require campaignId when source is campaign', () => {
      const data = { ...getValidData(), source: 'campaign' as const, campaignId: '', donationCenterId: '' };
      const result = donorSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const campaignIssue = result.error.issues.find(issue => issue.path.includes('campaignId'));
        expect(campaignIssue).toBeDefined();
        expect(campaignIssue?.message).toBe('اختر الحملة');
      }
    });

    it('should pass on source app without center or campaign ID', () => {
      const data = { ...getValidData(), source: 'app' as const, campaignId: '', donationCenterId: '' };
      const result = donorSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('weight, hemoglobin, bloodPressure validation', () => {
    it('should fail on empty weight', () => {
      const data = { ...getValidData(), weight: '' };
      const result = donorSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should fail on invalid or zero/negative weight', () => {
      const dataZero = { ...getValidData(), weight: '0' };
      const dataNeg = { ...getValidData(), weight: '-5' };
      const dataNaN = { ...getValidData(), weight: 'abc' };
      expect(donorSchema.safeParse(dataZero).success).toBe(false);
      expect(donorSchema.safeParse(dataNeg).success).toBe(false);
      expect(donorSchema.safeParse(dataNaN).success).toBe(false);
    });

    it('should fail on empty hemoglobin', () => {
      const data = { ...getValidData(), hemoglobin: '' };
      const result = donorSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should fail on invalid or zero/negative hemoglobin', () => {
      const dataZero = { ...getValidData(), hemoglobin: '0' };
      const dataNeg = { ...getValidData(), hemoglobin: '-1.2' };
      const dataNaN = { ...getValidData(), hemoglobin: 'xyz' };
      expect(donorSchema.safeParse(dataZero).success).toBe(false);
      expect(donorSchema.safeParse(dataNeg).success).toBe(false);
      expect(donorSchema.safeParse(dataNaN).success).toBe(false);
    });

    it('should fail on empty bloodPressure', () => {
      const data = { ...getValidData(), bloodPressure: '' };
      const result = donorSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
