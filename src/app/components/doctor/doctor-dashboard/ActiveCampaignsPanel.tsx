import { Megaphone, ArrowUpRight } from 'lucide-react';
import type { ActiveCampaign } from '../../../types/doctorDashboard';

interface ActiveCampaignsPanelProps {
  campaigns: ActiveCampaign[];
  onViewAll: () => void;
}

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  active: { label: 'نشطة', cls: 'bg-green-100 text-green-700' },
  notactive: { label: 'قادمة', cls: 'bg-blue-100 text-blue-700' },
  upcoming: { label: 'قادمة', cls: 'bg-blue-100 text-blue-700' },
  completed: { label: 'مكتملة', cls: 'bg-gray-100 text-gray-600' },
  cancelled: { label: 'ملغاة', cls: 'bg-red-100 text-red-600' },
};

export default function ActiveCampaignsPanel({ campaigns, onViewAll }: ActiveCampaignsPanelProps) {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-foreground" style={{ fontSize: '16px', fontWeight: 700 }}>
          الحملات النشطة
        </h2>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-green-600 hover:underline"
          style={{ fontSize: '12px' }}
        >
          الكل <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="space-y-3 overflow-y-auto max-h-48">
        {campaigns.slice(0, 4).map((c) => {
          const pct =
            c.targetDonors > 0 ? Math.round((c.registeredDonors / c.targetDonors) * 100) : 0;
          const statusCfg = STATUS_STYLE[c.status] ?? {
            label: c.status,
            cls: 'bg-muted text-muted-foreground',
          };
          return (
            <div key={c.id} className="p-3 bg-muted/40 rounded-xl">
              <div className="flex items-start justify-between mb-1.5">
                <p
                  className="text-foreground text-right"
                  style={{ fontSize: '12px', fontWeight: 700 }}
                >
                  {c.title}{' '}
                  <span className="text-muted-foreground text-[10px] font-mono">
                    ({c.campaignCode})
                  </span>
                </p>
                <span
                  className={`px-1.5 py-0.5 rounded-full flex-shrink-0 mr-2 ${statusCfg.cls}`}
                  style={{ fontSize: '10px', fontWeight: 700 }}
                >
                  {statusCfg.label}
                </span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground" style={{ fontSize: '10px' }}>
                  {c.registeredDonors} / {c.targetDonors}
                </span>
                <span className="text-green-600" style={{ fontSize: '10px', fontWeight: 700 }}>
                  {pct}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
        {campaigns.length === 0 && (
          <div className="py-6 text-center text-muted-foreground">
            <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p style={{ fontSize: '13px' }}>لا توجد حملات نشطة</p>
          </div>
        )}
      </div>
    </div>
  );
}
