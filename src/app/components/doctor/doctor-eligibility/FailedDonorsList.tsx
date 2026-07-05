import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { FailedDonorDetail } from '../../../types/donor';

interface FailedDonorsListProps {
  failedDonors: FailedDonorDetail[];
  compact?: boolean;
}

export default function FailedDonorsList({ failedDonors, compact = false }: FailedDonorsListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyPhone = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-2">
      {failedDonors.map((donor) => (
        <div
          key={donor.donorId}
          className={`${
            compact ? 'p-2.5 rounded-xl gap-2 text-xs' : 'p-4 rounded-2xl gap-4 text-sm'
          } bg-muted/30 border border-border flex items-start justify-between hover:border-border/80 transition-colors text-right`}
        >
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-foreground font-bold truncate ${compact ? 'text-xs' : 'text-sm'}`}>
                {donor.fullName}
              </span>
              <span className={`px-1.5 py-0.2 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-extrabold rounded ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
                {donor.bloodType}
              </span>
            </div>
            <p className={`text-red-500 dark:text-red-400 leading-normal ${compact ? 'text-[10px]' : 'text-xs'}`}>
              {donor.failureReason}
            </p>
            <div className="flex items-center gap-2 pt-0.5 justify-start dir-ltr">
              <span className={`text-muted-foreground font-mono ${compact ? 'text-[10px]' : 'text-xs'}`}>
                {donor.phoneNumber}
              </span>
              <button
                onClick={() => handleCopyPhone(donor.phoneNumber, donor.donorId)}
                className="p-1 text-muted-foreground hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                title="نسخ رقم الهاتف"
                aria-label="نسخ رقم الهاتف"
              >
                {copiedId === donor.donorId ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
