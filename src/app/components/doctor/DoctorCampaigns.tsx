import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import {
  useFilteredCampaigns,
  useCreateCampaign,
  useUpdateCampaign,
  useDeleteCampaign,
  useCompleteCampaign,
} from '../../hooks/useCampaigns';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
  generatePaginationNumbers,
} from '../ui/pagination';
import { useCancelAppointment, useMarkNoShow } from '../../hooks/useAppointments';
import { CancelModal } from '../shared/CancelModal';
import { ConfirmModal } from '../shared/ConfirmModal';
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
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useFilteredCampaigns({
    page,
    limit: 6,
    status: filterStatus,
    search: searchQuery,
  });

  const campaigns = response?.data || [];
  const total = response?.total || 0;
  const totalPages = Math.ceil(total / 6) || 1;

  const createCampaignMutation = useCreateCampaign();
  const updateCampaignMutation = useUpdateCampaign();
  const deleteCampaignMutation = useDeleteCampaign();
  const completeCampaignMutation = useCompleteCampaign();
  const cancelMutation = useCancelAppointment();
  const noShowMutation = useMarkNoShow();
  const [showModal, setShowModal] = useState(false);
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<AppointmentSlot | null>(null);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);

  // ── Form state ──
  const [form, setForm] = useState<CampaignFormState>(FORM_DEFAULTS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'danger' | 'success';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'danger',
    onConfirm: () => {},
  });

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
    if (!form.latitude || !form.longitude) e.location = 'يرجى تحديد الموقع';
    if (!form.targetDonors || +form.targetDonors < 1) e.targetDonors = 'أدخل العدد المستهدف';

    if (form.recurrenceType === 'custom' && form.recurrenceDays.length === 0) {
      e.recurrence = 'يرجى اختيار يوم واحد على الأقل';
    }

    if (!form.availableDonationTypes || form.availableDonationTypes.length === 0) {
      e.availableDonationTypes = 'يرجى اختيار نوع تبرع واحد على الأقل';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveCampaign = () => {
    if (!validate()) return;
    const campaignData = {
      title: form.title,
      latitude: parseFloat(form.latitude) || undefined,
      longitude: parseFloat(form.longitude) || undefined,
      city: form.city,
      targetDonors: +form.targetDonors,
      startTime: form.startTime,
      endTime: form.endTime,
      slotDuration: +form.slotDuration,
      slotCapacity: +form.slotCapacity,
      description: form.description,
      recurrence: {
        enabled: form.recurrenceType !== 'none',
        type: form.recurrenceType,
        weekDays: form.recurrenceType === 'custom' ? form.recurrenceDays : undefined,
        endDate: form.recurrenceEndDate || null,
      },
      availableDonationTypes: form.availableDonationTypes,
    };

    if (editingCampaignId) {
      updateCampaignMutation.mutate(
        { id: editingCampaignId, payload: campaignData },
        {
          onSuccess: () => {
            toast.success('تم تحديث الحملة بنجاح');
            setShowModal(false);
            setForm(FORM_DEFAULTS);
            setEditingCampaignId(null);
            setErrors({});
          },
          onError: () => {
            toast.error('تعذر تحديث الحملة، حاول مرة أخرى');
          },
        },
      );
    } else {
      createCampaignMutation.mutate(campaignData, {
        onSuccess: () => {
          toast.success('تم إنشاء الحملة بنجاح');
          setShowModal(false);
          setForm(FORM_DEFAULTS);
          setEditingCampaignId(null);
          setErrors({});
        },
        onError: () => {
          toast.error('تعذر إنشاء الحملة، حاول مرة أخرى');
        },
      });
    }
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setForm({
      title: campaign.title,
      city: campaign.city,
      latitude: campaign.latitude?.toString() || '',
      longitude: campaign.longitude?.toString() || '',
      targetDonors: campaign.targetDonors.toString(),
      description: campaign.description,
      startTime: campaign.startTime,
      endTime: campaign.endTime,
      slotDuration: campaign.slotDuration.toString(),
      slotCapacity: campaign.slotCapacity.toString(),
      recurrenceType: campaign.recurrence?.type || 'none',
      recurrenceDays: campaign.recurrence?.weekDays || [],
      recurrenceEndDate: campaign.recurrence?.endDate || '',
      availableDonationTypes:
        campaign.availableDonationTypes && campaign.availableDonationTypes.length > 0
          ? campaign.availableDonationTypes.map((t) => t.toLowerCase())
          : ['wholeblood'],
    });
    setEditingCampaignId(campaign.id);
    setShowModal(true);
  };

  const handleDeleteCampaign = (campaign: Campaign) => {
    setConfirmModal({
      isOpen: true,
      title: 'تأكيد الحذف',
      message: `هل أنت متأكد من حذف حملة "${campaign.title}" نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`,
      variant: 'danger',
      onConfirm: () => {
        deleteCampaignMutation.mutate(campaign.id, {
          onSuccess: () => toast.success('تم حذف الحملة بنجاح'),
          onError: () => toast.error('تعذر حذف الحملة، حاول مرة أخرى'),
        });
        setConfirmModal((p) => ({ ...p, isOpen: false }));
      },
    });
  };

  const handleCompleteCampaign = (campaign: Campaign) => {
    setConfirmModal({
      isOpen: true,
      title: 'إنهاء الحملة',
      message: `هل أنت متأكد من إنهاء حملة "${campaign.title}" الآن؟ سيتم إغلاق التسجيل في هذه الحملة ولا يمكن إعادتها للحالة النشطة.`,
      variant: 'success',
      onConfirm: () => {
        completeCampaignMutation.mutate(campaign.id, {
          onSuccess: () => toast.success('تم إنهاء الحملة بنجاح'),
          onError: () => toast.error('تعذر إنهاء الحملة، حاول مرة أخرى'),
        });
        setConfirmModal((p) => ({ ...p, isOpen: false }));
      },
    });
  };

  const handleNoShow = async (slot: AppointmentSlot) => {
    try {
      await noShowMutation.mutateAsync(slot.id);
      toast.warning(`تم تسجيل غياب ${slot.donorName || 'المتبرع'}`);
    } catch {
      toast.error('تعذر تسجيل الغياب');
    }
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
          onClick={() => {
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            const later = new Date(now.getTime() + 3 * 60 * 60 * 1000);
            const laterTime = `${String(later.getHours()).padStart(2, '0')}:${String(later.getMinutes()).padStart(2, '0')}`;

            setForm({ ...FORM_DEFAULTS, startTime: currentTime, endTime: laterTime });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl transition-all shadow-sm bg-green-600 hover:bg-green-700"
          style={{ fontSize: '14px', fontWeight: 700 }}
        >
          <Plus className="w-5 h-5" /> إنشاء حملة جديدة
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <Search className="w-5 h-5 text-muted-foreground" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          placeholder="ابحث عن حملة بالاسم أو المدينة..."
          className="w-full pl-4 pr-12 py-3 border border-border rounded-xl bg-card text-foreground focus:ring-2 focus:ring-green-100 focus:border-green-400 outline-none transition-all"
          style={{ fontSize: '14px' }}
        />
      </div>

      {/* Stats/Filters */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'حملات نشطة',
            color: 'text-emerald-700 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
            val: 'active',
          },
          {
            label: 'حملات غير نشطة',
            color: 'text-amber-700 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-500/10',
            val: 'notactive',
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
            onNoShowSlot={handleNoShow}
            onEdit={handleEditCampaign}
            onDelete={handleDeleteCampaign}
            onComplete={handleCompleteCampaign}
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
              {generatePaginationNumbers(page, totalPages).map((item, i) => (
                <PaginationItem key={item === 'ellipsis' ? `ellipsis-${i}` : item}>
                  {item === 'ellipsis' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href="#"
                      isActive={page === item}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(item as number);
                      }}
                    >
                      {item}
                    </PaginationLink>
                  )}
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

      {showModal && (
        <CreateCampaignModal
          form={form}
          errors={errors}
          onUpdateForm={(updater) => setForm(updater)}
          onClose={() => {
            setShowModal(false);
            setEditingCampaignId(null);
          }}
          onSave={saveCampaign}
          isEditing={!!editingCampaignId}
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

      {/* Confirm Action Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((p) => ({ ...p, isOpen: false }))}
      />
    </div>
  );
}
