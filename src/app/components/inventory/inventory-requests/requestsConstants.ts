/** Urgency badge colors */
export const urgencyColors: Record<string, string> = {
  normal: 'bg-blue-100 text-blue-700',
  urgent: 'bg-orange-100 text-orange-700',
  emergency: 'bg-red-100 text-red-700',
};

/** Urgency Arabic labels */
export const urgencyLabels: Record<string, string> = {
  normal: 'عادي',
  urgent: 'عاجل',
  emergency: 'طارئ',
};

/** Status badge colors */
export const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  fulfilled: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
};

/** Status Arabic labels */
export const statusLabels: Record<string, string> = {
  pending: 'قيد المراجعة',
  approved: 'معتمد',
  fulfilled: 'تم الصرف',
  rejected: 'مرفوض',
};
