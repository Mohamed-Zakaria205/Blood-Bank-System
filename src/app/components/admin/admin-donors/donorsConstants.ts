/** Donor status badge colors */
export const statusColors: Record<string, string> = {
  eligible: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  deferred: 'bg-orange-100 text-orange-700',
};

/** Donor status Arabic labels */
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

/** Admin donors table headers */
export const adminDonorsHeaders = [
  'رمز المتبرع',
  'الاسم',
  'العنوان',
  'الفصيلة',
  'آخر تبرع',
  'عدد التبرعات',
  'الحالة',
  'إجراء',
] as const;
