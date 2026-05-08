import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCampaigns, useCreateCampaign } from '../../hooks/useCampaigns';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { useSlot15Data, useCancelAppointment } from '../../hooks/useAppointments';
import { CancelModal } from '../shared/CancelModal';
import type { Campaign } from '../../types/campaign';
import type { Slot15 } from '../../types/appointment';
import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';

// ── Sub-components ──
import type { CampaignFormState } from './doctor-campaigns/campaignConstants';
import { FORM_DEFAULTS } from './doctor-campaigns/campaignConstants';
import CampaignCard from './doctor-campaigns/CampaignCard';
import CreateCampaignModal from './doctor-campaigns/CreateCampaignModal';

export default function DoctorCampaigns() {
  const { user } = useAuth();
  const { data: slots = [] } = useSlot15Data();
  const { data: campaignsData = [], isLoading, isError, refetch } = useCampaigns();
  const createCampaignMutation = useCreateCampaign();
  const cancelMutation = useCancelAppointment();
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Slot15 | null>(null);

  const campaigns = campaignsData;

  // ── Form state ──
  const [form, setForm] = useState<CampaignFormState>(FORM_DEFAULTS);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = campaigns.filter((c) => !filterStatus || c.status === filterStatus);

  if (isLoading)
    return (
      <div className="space-y-6 p-2">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
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
          <h1 className="text-gray-900" style={{ fontSize: '22px', fontWeight: 800 }}>
            حملات التبرع
          </h1>
          <p className="text-gray-500" style={{ fontSize: '14px' }}>
            {campaigns.length} حملة مسجلة
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

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            label: 'حملات نشطة',
            count: campaigns.filter((c) => c.status === 'active').length,
            color: 'text-emerald-700',
            bg: 'bg-emerald-50',
            val: 'active',
          },
          {
            label: 'حملات منتهية',
            count: campaigns.filter((c) => c.status === 'completed').length,
            color: 'text-gray-600',
            bg: 'bg-gray-100',
            val: 'completed',
          },
        ].map((s, i) => (
          <button
            key={i}
            onClick={() => setFilterStatus(filterStatus === s.val ? '' : s.val)}
            className={`${s.bg} rounded-xl p-4 text-center transition-all hover:opacity-80 ${filterStatus === s.val ? 'ring-2 ring-offset-1 ring-green-400' : ''}`}
          >
            <div className={s.color} style={{ fontSize: '24px', fontWeight: 800 }}>
              {s.count}
            </div>
            <div className="text-gray-600" style={{ fontSize: '12px' }}>
              {s.label}
            </div>
          </button>
        ))}
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.map((c) => (
          <CampaignCard
            key={c.id}
            campaign={c}
            isMyCampaign={c.createdBy === user?.id}
            slots={slots}
            expandedCampaign={expandedCampaign}
            onToggleExpand={(id) => setExpandedCampaign(expandedCampaign === id ? null : id)}
            onCancelSlot={(apt) => setCancelTarget(apt)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 py-16 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
            <p style={{ fontSize: '14px' }}>لا توجد حملات</p>
          </div>
        )}
      </div>

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
