/** Donation type Arabic labels */
export const donationTypeLabels: Record<string, string> = {
  whole: 'دم كامل',
  plasma: 'بلازما',
  platelets: 'صفائح',
};

/** Blood inventory status colors */
export const bloodStatusColor: Record<string, string> = {
  normal: 'bg-green-500',
  low: 'bg-yellow-500',
  critical: 'bg-red-500',
};

/** Recent donors table headers */
export const recentDonorsHeaders = [
  'رمز المتبرع',
  'الاسم',
  'المدينة',
  'الفصيلة',
  'نوع التبرع',
  'الحالة',
  'إجراء',
] as const;
