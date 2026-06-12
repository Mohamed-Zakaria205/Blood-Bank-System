import { useNavigate } from 'react-router';
import {
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  CalendarDays,
  ChevronDown,
  UserPlus,
  XCircle,
  Edit,
  Trash2,
  CheckCircle,
} from 'lucide-react';

import type { Campaign } from '../../../types/campaign';
import type { AppointmentSlot } from '../../../types/appointment';
import { statusColors, statusLabels, DONATION_TYPE_LABELS } from './campaignConstants';
import { useCampaignAppointments } from '../../../hooks/useCampaigns';

interface CampaignCardProps {
  campaign: Campaign;
  isMyCampaign: boolean;
  expandedCampaign: string | null;
  onToggleExpand: (id: string) => void;
  onCancelSlot: (slot: AppointmentSlot) => void;
  onEdit?: (campaign: Campaign) => void;
  onDelete?: (campaign: Campaign) => void;
  onComplete?: (campaign: Campaign) => void;
}

export default function CampaignCard({
  campaign: c,
  isMyCampaign,
  expandedCampaign,
  onToggleExpand,
  onCancelSlot,
  onEdit,
  onDelete,
  onComplete,
}: CampaignCardProps) {
  const navigate = useNavigate();
  const isExpanded = expandedCampaign === c.id;

  // ── Lazy fetch: only fires when the card is expanded ──
  const { data: campApts = [], isLoading: isSlotsLoading } = useCampaignAppointments(
    isExpanded ? c.id : null
  );

  // Use server-provided count for the badge; fall back to fetched length after load
  const badgeCount = c.appointmentsCount ?? campApts.length;

  const pct = Math.round((c.registeredDonors / c.targetDonors) * 100);
  const progressColor =
    c.status === 'completed'
      ? 'bg-green-500'
      : pct >= 75
        ? 'bg-green-500'
        : pct >= 40
          ? 'bg-yellow-400'
          : 'bg-red-400';
  const progressTextColor =
    c.status === 'completed'
      ? 'text-green-600'
      : pct >= 75
        ? 'text-green-600'
        : pct >= 40
          ? 'text-yellow-500'
          : 'text-red-500';

  return (
    <div
      className={`bg-card rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all ${isMyCampaign ? 'border-green-100' : 'border-border'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={`px-2.5 py-0.5 rounded-full ${statusColors[c.status]}`}
              style={{ fontSize: '11px', fontWeight: 700 }}
            >
              {statusLabels[c.status]}
            </span>
            {isMyCampaign && (
              <span
                className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full"
                style={{ fontSize: '10px', fontWeight: 700 }}
              >
                حملتي
              </span>
            )}
          </div>
          <h3 className="text-foreground" style={{ fontSize: '15px', fontWeight: 700 }}>
            {c.title}
          </h3>
        </div>
        {c.status !== 'completed' && (
          <div className="flex items-center gap-1">
            {onComplete && (
              <button
                onClick={() => onComplete(c)}
                className="p-1.5 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                title="إنهاء الحملة"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(c)}
                className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="تعديل الحملة"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onDelete && badgeCount === 0 && (
              <button
                onClick={() => onDelete(c)}
                className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="حذف الحملة"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
          <span style={{ fontSize: '13px' }}>
            {c.city}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
          <span style={{ fontSize: '13px' }}>{c.date}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
          <span style={{ fontSize: '13px' }}>{c.createdByName}</span>
        </div>
      </div>
      {c.description && (
        <p className="text-muted-foreground mb-4" style={{ fontSize: '12px' }}>
          {c.description}
        </p>
      )}

      {c.availableDonationTypes && c.availableDonationTypes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {c.availableDonationTypes.map((type) => {
            const lowerType = type.toLowerCase();
            return (
              <span
                key={type}
                className="px-2.5 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30 rounded-lg text-[11px] font-semibold"
              >
                {DONATION_TYPE_LABELS[lowerType] || type}
              </span>
            );
          })}
        </div>
      )}

      {/* Progress */}
      <div>
        <div className="flex justify-between mb-1.5">
          <span className="text-muted-foreground" style={{ fontSize: '12px', fontWeight: 600 }}>
            الإنجاز
          </span>
          <span className={progressTextColor} style={{ fontSize: '12px', fontWeight: 700 }}>
            {c.registeredDonors} / {c.targetDonors}
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${progressColor}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className={`${progressTextColor}`} style={{ fontSize: '11px' }}>
            {pct}% مكتمل
          </span>
          {c.status !== 'completed' && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="w-3 h-3" />
              <span style={{ fontSize: '11px' }}>
                يتبقى {c.targetDonors - c.registeredDonors} متبرع
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Campaign Appointments — only shown if the campaign has any */}
      {badgeCount > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <button
            onClick={() => onToggleExpand(c.id)}
            className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl transition-all ${isExpanded ? 'bg-green-50 border border-green-100' : 'hover:bg-muted/40 border border-border'}`}
          >
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-green-600" />
              <span
                className="text-green-700"
                style={{ fontSize: '13px', fontWeight: 700 }}
              >
                المواعيد من التطبيق
              </span>
              <span
                className="px-2 py-0.5 bg-green-600 text-white rounded-full"
                style={{ fontSize: '11px', fontWeight: 700 }}
              >
                {badgeCount}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-green-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
          {isExpanded && (
            <div className="mt-3 space-y-2">
              {isSlotsLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                campApts.map((apt) => {
                  const isCancelled = apt.status === 'cancelled';
                  const isCompleted = apt.status === 'completed';
                  const isMissed = apt.status === 'missed';
                  const isBooked = apt.status === 'booked';
                  return (
                    <div
                      key={apt.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all group ${
                        isCancelled
                          ? 'bg-red-50 border-red-100'
                          : isCompleted
                            ? 'bg-muted/40 border-border'
                            : 'bg-muted/40 border-border hover:border-green-200 hover:bg-green-50 cursor-pointer'
                      }`}
                      onClick={() => isBooked && navigate(`/doctor/register?apt=${apt.id}&campaignId=${c.id}`)}
                    >
                      <div className="flex-shrink-0 text-center w-14">
                        <span
                          className={`font-mono ${isCancelled ? 'text-red-400 line-through' : 'text-green-700'}`}
                          style={{ fontSize: '13px', fontWeight: 700 }}
                          dir="ltr"
                        >
                          {apt.time}
                        </span>
                        <p className="text-muted-foreground" style={{ fontSize: '10px' }}>
                          {apt.date}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`truncate ${isCancelled ? 'text-red-400 line-through' : 'text-foreground'}`}
                          style={{ fontSize: '13px', fontWeight: 600 }}
                        >
                          {apt.donorName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {apt.donorBloodType && (
                            <span
                              className={`${isCancelled ? 'text-red-300' : 'text-red-600'}`}
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                              }}
                            >
                              {apt.donorBloodType}
                            </span>
                          )}
                          {isCancelled && apt.cancelledByName && (
                            <span className="text-red-400" style={{ fontSize: '10px' }}>
                              ألغاه: {apt.cancelledByName}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-white ${
                            isCompleted
                              ? 'bg-gray-400'
                              : isMissed
                                ? 'bg-orange-500'
                                : isCancelled
                                  ? 'bg-red-500'
                                  : 'bg-green-600'
                          }`}
                          style={{ fontSize: '10px', fontWeight: 700 }}
                        >
                          {isCompleted
                            ? 'مكتمل'
                            : isMissed
                              ? 'لم يحضر'
                              : isCancelled
                                ? 'ملغى'
                                : 'محجوز'}
                        </span>
                        {isBooked && (
                          <>
                            <UserPlus className="w-4 h-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onCancelSlot(apt);
                              }}
                              className="p-1 rounded-lg border border-red-200 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                              title="إلغاء الموعد"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
