import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useFilteredCampaigns, useCreateCampaign } from '../../hooks/useCampaigns';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';
import { useCancelAppointment } from '../../hooks/useAppointments';
import { CancelModal } from '../shared/CancelModal';
import type { Campaign } from '../../types/campaign';
import type { AppointmentSlot } from '../../types/appointment';
import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';

// ── Sub-components ──
import type { CampaignFormState } from './doctor-campaigns/campaignConstants';
import { FORM_DEFAULTS } from './doctor-campaigns/campaignConstants';
import CampaignCard from './doctor-campaigns/CampaignCard';
import CreateCampaignModal from './doctor-campaigns/CreateCampaignModal';

export default function DoctorCampaigns() {
  const { user } = useAuth();

  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  
  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useFilteredCampaigns({
    page,
    limit: 6,
    status: filterStatus,
  });
  
  const campaigns = response?.data || [];
  const total = response?.total || 0;
  const totalPages = Math.ceil(total / 6) || 1;

  const createCampaignMutation = useCreateCampaign();
  const cancelMutation = useCancelAppointment();
  const [showModal, setShowModal] = useState(false);
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<AppointmentSlot | null>(null);

  // ── Form state ──
  const [form, setForm] = useState<CampaignFormState>(FORM_DEFAULTS);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFilterStatus = (status: string) => {
    setFilterStatus(filterStatus === status ? '' : status);
    setPage(1);
  };

  if (isLoading)
    return (
      <div className="space-y-6 p-2">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <CardSkeleton count={3} />
        <TableSkeleton rows={5} cols={6} />
      </div>
    );
  if (isError) return <ErrorState message="تعذر تحميل بيانات الحملات" onRetry={() => refetch()} />;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'أدخل عنوان الحملة';
    if (!form.location.trim()) e.location = 'أدخل موقع الحملة';
    if (!form.date) e.date = 'اختر تاريخ الحملة';
    if (!form.targetDonors || +form.targetDonors < 1) e.targetDonors = 'أدخل العدد المستهدف';
    if (form.startTime >= form.endTime) e.startTime = 'وقت البداية يجب أن يكون قبل وقت الانتهاء';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const createCampaign = () => {
    if (!validate()) return;
    const newCampaign: Campaign = {
      id: `CAM-${Date.now()}`,
      title: form.title,
      location: form.location,
      city: form.city,
      date: form.date,
      targetDonors: +form.targetDonors,
      registeredDonors: 0,
      status: 'active',
      createdBy: user?.id || 'USR-002',
      createdByName: user?.name || 'طبيب',
      description: form.description,
    };
    createCampaignMutation.mutate(newCampaign, {
      onSuccess: () => {
        toast.success('تم إنشاء الحملة بنجاح');
        setShowModal(false);
        setForm(FORM_DEFAULTS);
        setErrors({});
      },
      onError: () => {
        toast.error('تعذر إنشاء الحملة، حاول مرة أخرى');
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-foreground" style={{ fontSize: '22px', fontWeight: 800 }}>
            حملات التبرع
          </h1>
          <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
            {total} حملة مسجلة
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl transition-all shadow-sm bg-green-600 hover:bg-green-700"
          style={{ fontSize: '14px', fontWeight: 700 }}
        >
          <Plus className="w-5 h-5" /> إنشاء حملة جديدة
        </button>
      </div>

      {/* Stats/Filters */}
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            label: 'حملات نشطة',
            color: 'text-emerald-700 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
            val: 'active',
          },
          {
            label: 'حملات منتهية',
            color: 'text-muted-foreground',
            bg: 'bg-muted',
            val: 'completed',
          },
        ].map((s, i) => (
          <button
            key={i}
            onClick={() => handleFilterStatus(s.val)}
            className={`${s.bg} rounded-xl p-4 text-center transition-all hover:opacity-80 ${filterStatus === s.val ? 'ring-2 ring-offset-1 ring-green-400' : ''}`}
          >
            <div className={`${s.color}`} style={{ fontSize: '18px', fontWeight: 800 }}>
              {s.label}
            </div>
          </button>
        ))}
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {campaigns.map((c) => (
          <CampaignCard
            key={c.id}
            campaign={c}
            isMyCampaign={c.createdBy === user?.id}
            expandedCampaign={expandedCampaign}
            onToggleExpand={(id) => setExpandedCampaign(expandedCampaign === id ? null : id)}
            onCancelSlot={(apt) => setCancelTarget(apt)}
          />
        ))}
        {campaigns.length === 0 && (
          <div className="col-span-2 py-16 text-center text-muted-foreground bg-card rounded-2xl border border-border">
            <p style={{ fontSize: '14px' }}>لا توجد حملات</p>
          </div>
        )}
      </div>

      {/* Pagination UI */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center pt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) setPage(page - 1);
                  }}
                  className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink
                    href="#"
                    isActive={page === i + 1}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(i + 1);
                    }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) setPage(page + 1);
                  }}
                  className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showModal && (
        <CreateCampaignModal
          form={form}
          errors={errors}
          onUpdateForm={(updater) => setForm(updater)}
          onSubmit={createCampaign}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Cancel Appointment Modal */}
      {cancelTarget && (
        <CancelModal
          slot={cancelTarget}
          doctorName={user?.name || 'الطبيب'}
          onConfirm={async (reason: string) => {
            try {
              await cancelMutation.mutateAsync({
                slotId: cancelTarget.id,
                reason,
              });
              toast.success('تم إلغاء الموعد بنجاح');
            } catch (err) {
              console.error(err);
            } finally {
              setCancelTarget(null);
            }
          }}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}
