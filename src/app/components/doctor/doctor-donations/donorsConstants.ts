/** Status badge colors */
export const statusColors: Record<string, string> = {
  eligible: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  deferred: 'bg-orange-100 text-orange-700',
};

/** Status Arabic labels */
export const statusLabels: Record<string, string> = {
  eligible: 'مؤهل',
  rejected: 'غير مؤهل',
  deferred: 'موجل',
};

/** Donation type Arabic labels */
export const donationTypeLabels: Record<string, string> = {
  wholeblood: 'دم كامل',
  plasma: 'بلازما',
  platelets: 'صفائح',
};

/** Gender Arabic labels */
export const genderLabels: Record<string, string> = {
  male: 'ذكر',
  female: 'أنثى',
};

/** Table column headers for Donations page */
export const tableHeaders = [
  'رمز التبرع',
  'الاسم',
  'الجنس',
  'الهاتف',
  'المدينة',
  'الفصيلة',
  'نوع التبرع',
  'المصدر',
  'إجراء',
  'عرض',
] as const;
