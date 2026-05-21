/** Blood inventory status colors */
export const bloodStatusColor: Record<string, string> = {
  normal: 'bg-green-500',
  low: 'bg-yellow-500',
  critical: 'bg-red-500',
};

/** Recent donations table headers */
export const recentDonorsHeaders = [
  'رمز التبرع',
  'الاسم',
  'المدينة',
  'الفصيلة',
  'تاريخ التبرع',
  'إجراء',
] as const;
