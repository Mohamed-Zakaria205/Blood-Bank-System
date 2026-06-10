import { Megaphone, ArrowUpRight } from 'lucide-react';
import type { ActiveCampaign } from '../../../types/doctorDashboard';

interface ActiveCampaignsPanelProps {
  campaigns: ActiveCampaign[];
  onViewAll: () => void;
}

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
          const pct = Math.round((c.registeredDonors / c.targetDonors) * 100);
          return (
            <div key={c.id} className="p-3 bg-muted/40 rounded-xl">
              <div className="flex items-start justify-between mb-1.5">
                <p
                  className="text-foreground text-right"
                  style={{ fontSize: '12px', fontWeight: 700 }}
                >
                  {c.title}
                </p>
                <span
                  className={`px-1.5 py-0.5 rounded-full flex-shrink-0 mr-2 ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}
                  style={{ fontSize: '10px', fontWeight: 700 }}
                >
                  {c.status === 'active' ? 'نشطة' : 'قادمة'}
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
