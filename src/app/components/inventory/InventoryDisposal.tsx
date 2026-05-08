import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  AlertOctagon,
} from 'lucide-react';
import { toast } from 'sonner';
import type { BloodType } from '../../types';
import { useBloodBags, useOutflowRecords, useDisposeBag } from '../../hooks/useInventory';
import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';

// ── Sub-components ──
import {
  daysUntil,
  DISPOSAL_REASONS,
} from './inventory-disposal/disposalConstants';
import DisposalForm from './inventory-disposal/DisposalForm';
import DisposalHistory from './inventory-disposal/DisposalHistory';
import ConfirmDisposalModal from './inventory-disposal/ConfirmDisposalModal';

export { DISPOSAL_REASONS } from './inventory-disposal/disposalConstants';

export default function InventoryDisposal() {
  const { data: bags = [], isLoading: isLoadingBags, isError: isErrorBags } = useBloodBags();
  const {
    data: outflowRecords = [],
    isLoading: isLoadingOutflow,
    isError: isErrorOutflow,
  } = useOutflowRecords();
  const disposeBagMutation = useDisposeBag();

  /* form state */
  const [bagSearch, setBagSearch] = useState('');
  const [selectedBagIds, setSelectedBagIds] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [targetStatus, setTargetStatus] = useState<'disposed' | 'rejected'>('disposed');
  const [notes, setNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);

  /* history state */
  const [histSearch, setHistSearch] = useState('');
  const [histCategory, setHistCategory] = useState('all');
  const [histBloodType, setHistBloodType] = useState<BloodType | 'all'>('all');
  const [histStaff, setHistStaff] = useState('');

  if (isLoadingBags || isLoadingOutflow)
    return (
      <div className="space-y-6 p-2">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <CardSkeleton count={3} />
        <TableSkeleton rows={5} cols={6} />
      </div>
    );
  if (isErrorBags || isErrorOutflow)
    return (
      <ErrorState
        message="فشل في تحميل البيانات، يرجى المحاولة لاحقاً"
        onRetry={() => window.location.reload()}
      />
    );

  /* ── computed ── */
  const nearExpiryCount = bags.filter((b) => {
    const d = daysUntil(b.expiryDate);
    return b.status === 'available' && d >= 0 && d <= 5;
  }).length;
  const expiredCount = bags.filter(
    (b) => b.status === 'available' && daysUntil(b.expiryDate) < 0,
  ).length;
  const rejectedCount = bags.filter((b) => b.status === 'rejected').length;
  const disposedCount = bags.filter((b) => b.status === 'disposed').length;
  const flaggedCount = nearExpiryCount + expiredCount + rejectedCount;

  const candidateBags = (() => {
    const eligible = bags.filter(
      (b) => b.status !== 'disposed' && b.status !== 'issued' && b.status !== 'expired',
    );
    const searched = bagSearch.trim()
      ? eligible.filter(
          (b) =>
            b.bagCode.toLowerCase().includes(bagSearch.toLowerCase()) ||
            b.bloodType.toLowerCase().includes(bagSearch.toLowerCase()),
        )
      : eligible.slice(0, 40);

    return searched.sort((a, b) => {
      const priority = (bag: typeof a) => {
        if (bag.status === 'rejected') return 0;
        const d = daysUntil(bag.expiryDate);
        if (d < 0) return 1;
        if (d <= 3) return 2;
        if (d <= 5) return 3;
        return 4;
      };
      const pa = priority(a),
        pb = priority(b);
      if (pa !== pb) return pa - pb;
      return daysUntil(a.expiryDate) - daysUntil(b.expiryDate);
    });
  })();

  const selectedBagsData = bags.filter((b) => selectedBagIds.includes(b.id));

  const disposalRecords = outflowRecords.filter((r) => r.actionType === 'disposed');
  const staffList = [...new Set(disposalRecords.map((r) => r.performedByName))];

  const filteredHistory = disposalRecords.filter((r) => {
    if (histBloodType !== 'all' && r.bloodType !== histBloodType) return false;
    if (histCategory !== 'all' && r.disposalCategory !== histCategory) return false;
    if (histStaff && r.performedByName !== histStaff) return false;
    if (
      histSearch &&
      !r.bagCode.includes(histSearch) &&
      !(r.performedByName ?? '').includes(histSearch) &&
      !r.reason.includes(histSearch)
    )
      return false;
    return true;
  });

  /* ── handlers ── */
  const toggleSelect = (bagId: string) => {
    setSelectedBagIds((prev) =>
      prev.includes(bagId) ? prev.filter((id) => id !== bagId) : [...prev, bagId],
    );
    if (formErrors.bags) setFormErrors((p) => ({ ...p, bags: '' }));
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    const r = DISPOSAL_REASONS.find((r) => r.value === val);
    if (r) setTargetStatus(r.suggested);
    if (formErrors.category) setFormErrors((p) => ({ ...p, category: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (selectedBagIds.length === 0) e.bags = 'يجب تحديد حقيبة واحدة على الأقل';
    if (!category) e.category = 'يجب اختيار سبب الإتلاف';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleOpenConfirm = () => {
    if (validate()) setShowConfirm(true);
  };

  const handleConfirmDispose = async () => {
    const label = DISPOSAL_REASONS.find((r) => r.value === category)?.label ?? category;
    try {
      await Promise.all(
        selectedBagIds.map((id) => disposeBagMutation.mutateAsync({ bagId: id, reason: label })),
      );
      toast.success(`تم إتلاف ${selectedBagIds.length} حقيبة بنجاح`);
      setShowConfirm(false);
      setSelectedBagIds([]);
      setCategory('');
      setNotes('');
      setFormErrors({});
    } catch (err) {
      console.error(err);
    }
  };

  const hasHistFilters =
    histSearch || histBloodType !== 'all' || histCategory !== 'all' || histStaff;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900" style={{ fontSize: '22px', fontWeight: 800 }}>
          إتلاف وإخراج الحقائب
        </h1>
        <p className="text-gray-500" style={{ fontSize: '14px' }}>
          تسجيل إتلاف الحقائب التالفة أو المنتهية أو المرفوضة مع الحفاظ على سجل تدقيق كامل
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'قريبة الانتهاء',
            value: nearExpiryCount,
            color: 'text-orange-600',
            bg: 'bg-orange-50 border-orange-200',
            Icon: Clock,
          },
          {
            label: 'منتهية الصلاحية',
            value: expiredCount,
            color: 'text-red-600',
            bg: 'bg-red-50 border-red-200',
            Icon: AlertTriangle,
          },
          {
            label: 'مرفوضة مخبرياً',
            value: rejectedCount,
            color: 'text-purple-600',
            bg: 'bg-purple-50 border-purple-200',
            Icon: XCircle,
          },
          {
            label: 'إجمالي المُتلَف',
            value: disposedCount,
            color: 'text-gray-500',
            bg: 'bg-gray-50 border-gray-200',
            Icon: CheckCircle,
          },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border rounded-2xl p-5 shadow-sm`}>
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.Icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className={s.color} style={{ fontSize: '28px', fontWeight: 800 }}>
              {s.value}
            </div>
            <div
              className={`${s.color} opacity-80 mt-0.5`}
              style={{ fontSize: '12px', fontWeight: 600 }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Flagged alert banner */}
      {flaggedCount > 0 && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <AlertOctagon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700" style={{ fontSize: '13px', fontWeight: 700 }}>
              {flaggedCount} حقيبة تحتاج إجراء عاجل
            </p>
            <p className="text-red-500" style={{ fontSize: '11px', marginTop: '2px' }}>
              {expiredCount > 0 && `${expiredCount} منتهية الصلاحية`}
              {expiredCount > 0 && nearExpiryCount > 0 && ' · '}
              {nearExpiryCount > 0 && `${nearExpiryCount} قريبة الانتهاء`}
              {(expiredCount > 0 || nearExpiryCount > 0) && rejectedCount > 0 && ' · '}
              {rejectedCount > 0 && `${rejectedCount} مرفوضة مخبرياً`}
              {' — حددها من القائمة أدناه لتسجيل الإتلاف'}
            </p>
          </div>
        </div>
      )}

      {/* Disposal Form */}
      <DisposalForm
        bagSearch={bagSearch}
        onBagSearchChange={setBagSearch}
        candidateBags={candidateBags}
        selectedBagIds={selectedBagIds}
        selectedBagsData={selectedBagsData}
        category={category}
        targetStatus={targetStatus}
        notes={notes}
        formErrors={formErrors}
        onToggleSelect={toggleSelect}
        onCategoryChange={handleCategoryChange}
        onTargetStatusChange={setTargetStatus}
        onNotesChange={setNotes}
        onOpenConfirm={handleOpenConfirm}
      />

      {/* Disposal History */}
      <DisposalHistory
        disposalRecords={disposalRecords}
        filteredHistory={filteredHistory}
        staffList={staffList}
        histSearch={histSearch}
        histCategory={histCategory}
        histBloodType={histBloodType}
        histStaff={histStaff}
        hasHistFilters={!!hasHistFilters}
        onHistSearchChange={setHistSearch}
        onHistCategoryChange={setHistCategory}
        onHistBloodTypeChange={setHistBloodType}
        onHistStaffChange={setHistStaff}
        onClearFilters={() => {
          setHistSearch('');
          setHistBloodType('all');
          setHistCategory('all');
          setHistStaff('');
        }}
      />

      {/* Confirm Modal */}
      {showConfirm && (
        <ConfirmDisposalModal
          selectedBagsData={selectedBagsData}
          category={category}
          targetStatus={targetStatus}
          notes={notes}
          isPending={disposeBagMutation.isPending}
          onConfirm={handleConfirmDispose}
          onClose={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
