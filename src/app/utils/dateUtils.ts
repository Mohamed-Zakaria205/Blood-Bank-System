/**
 * Extracts the Date of Birth from an Egyptian National ID (14 digits).
 * Returns 'yyyy-MM-dd' or an empty string if invalid.
 */
export const extractDobFromNationalId = (nid: string): string => {
  if (!nid || nid.length !== 14) return '';
  const century = nid[0] === '2' ? '19' : nid[0] === '3' ? '20' : '19';
  const year = nid.substring(1, 3);
  const month = nid.substring(3, 5);
  const day = nid.substring(5, 7);
  // Validate extracted values — dirty data in some IDs can produce impossible dates
  const monthNum = parseInt(month, 10);
  const dayNum = parseInt(day, 10);
  if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) return '';
  return `${century}${year}-${month}-${day}`;
};

/**
 * Normalises a date string from the backend into "yyyy-MM-dd".
 * Handles: "yyyy-MM-dd" (already correct), "dd/MM/yyyy", "dd-MM-yyyy".
 * Returns empty string for anything that cannot be parsed.
 */
export const normalizeDateToISO = (raw: string | undefined | null): string => {
  if (!raw) return '';
  const trimmed = raw.trim();

  const strictValidate = (yyyy: string, mm: string, dd: string): string => {
    const year = parseInt(yyyy, 10);
    const month = parseInt(mm, 10);
    const day = parseInt(dd, 10);
    // Reject clearly impossible values before touching Date API
    if (month < 1 || month > 12 || day < 1 || day > 31) return '';
    if (year < 1900 || year > new Date().getFullYear()) return '';
    const candidate = `${yyyy}-${mm}-${dd}`;
    const d = new Date(candidate);
    // Extra guard: Date API can roll over (e.g. Dec 32 → Jan 1)
    if (isNaN(d.getTime())) return '';
    if (d.getMonth() + 1 !== month || d.getDate() !== day) return '';
    return candidate;
  };

  // Already yyyy-MM-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [yyyy, mm, dd] = trimmed.split('-');
    return strictValidate(yyyy, mm, dd);
  }
  // dd/MM/yyyy or dd-MM-yyyy
  const dmyMatch = trimmed.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})$/);
  if (dmyMatch) {
    const [, dd, mm, yyyy] = dmyMatch;
    return strictValidate(yyyy, mm, dd);
  }
  return '';
};
