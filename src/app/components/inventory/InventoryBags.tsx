import { useState } from 'react';
import {
  Search,
  Check,
  AlertTriangle,
  Upload,
  Trash2,
  ShoppingCart,
} from 'lucide-react';
import type { BloodBag, BloodType } from '../../types';
import { useBloodBags, useExportBags, useDisposeBag } from '../../hooks/useInventory';
import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { BLOOD_TYPES } from '../../constants';

// ── Sub-components ──
import { daysUntil, donTypeLabels, getBagStatus } from './inventory-bags/bagsConstants';
import type { ExportFormState } from './inventory-bags/bagsConstants';
import ExportBagsModal from './inventory-bags/ExportBagsModal';
import DisposeBagModal from './inventory-bags/DisposeBagModal';

export default function InventoryBags() {
  const { data: bags = [], isLoading, isError } = useBloodBags();
  const exportBagsMutation = useExportBags();
  const disposeBagMutation = useDisposeBag();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<BloodType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'available' | 'expired_only' | 'all'>('all');

  // ── Multi-select ──
  const [selectedBagIds, setSelectedBagIds] = useState<string[]>([]);

  // ── Export modal ──
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // ── Dispose modal ──
  const [disposeModal, setDisposeModal] = useState<BloodBag | null>(null);
  const [disposeReason, setDisposeReason] = useState('');

  if (isLoading)
    return (
      <div className="space-y-6 p-2">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <CardSkeleton count={3} />
        <TableSkeleton rows={5} cols={6} />
      </div>
    );
  if (isError)
    return (
      <ErrorState
        message="فشل في تحميل حقائب الدم، يرجى المحاولة لاحقاً"
        onRetry={() => window.location.reload()}
      />
    );

  /* ── derived ── */
  const displayBags = bags.filter((b) => {
    if (b.status === 'disposed') return false;
    const days = daysUntil(b.expiryDate);
    const isExpired = b.status === 'available' && days < 0;
    const isAvail = b.status === 'available' && days >= 0;

    if (filterStatus === 'available' && !isAvail) return false;
    if (filterStatus === 'expired_only' && !isExpired) return false;
    if (filterType !== 'all' && b.bloodType !== filterType) return false;

    return (
      b.bagCode.toLowerCase().includes(search.toLowerCase()) ||
      b.bloodType.includes(search) ||
      (b.donorCode ?? '').includes(search)
    );
  });

  const availableCount = bags.filter(
    (b) => b.status === 'available' && daysUntil(b.expiryDate) >= 0,
  ).length;
  const expiredCount = bags.filter(
    (b) => b.status === 'available' && daysUntil(b.expiryDate) < 0,
  ).length;
  const issuedCount = bags.filter((b) => b.status === 'issued').length;

  const selectedBagsData = bags.filter((b) => selectedBagIds.includes(b.id));

  /* ── helpers ── */
  const toggleSelect = (bagId: string) =>
    setSelectedBagIds((prev) =>
      prev.includes(bagId) ? prev.filter((id) => id !== bagId) : [...prev, bagId],
    );

  const openExportForBag = (bag: BloodBag) => {
    setSelectedBagIds([bag.id]);
    setExportModalOpen(true);
  };

  const handleConfirmExport = async (form: ExportFormState) => {
    try {
      await exportBagsMutation.mutateAsync({
        bagIds: selectedBagIds,
        recipient: form,
      });
      setExportModalOpen(false);
      setSelectedBagIds([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDispose = async () => {
    if (!disposeModal) return;
    try {
      await disposeBagMutation.mutateAsync({
        bagId: disposeModal.id,
        reason: disposeReason || 'إتلاف وفق البروتوكول',
      });
      setDisposeModal(null);
      setDisposeReason('');
    } catch (err) {
      console.error(err);
    }
  };

  /* ── render ── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900" style={{ fontSize: '22px', fontWeight: 800 }}>
          حقائب الدم
        </h1>
        <p className="text-gray-500" style={{ fontSize: '14px' }}>
          جرد شامل لجميع الحقائب المخزنة
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'متاحة وصالحة',
            value: availableCount,
            color: 'text-green-700',
            bg: 'bg-green-50 border-green-200',
            filter: 'available' as const,
          },
          {
            label: 'منتهية الصلاحية',
            value: expiredCount,
            color: 'text-red-700',
            bg: 'bg-red-50 border-red-200',
            filter: 'expired_only' as const,
          },
          {
            label: 'مُصدَّرة',
            value: issuedCount,
            color: 'text-blue-700',
            bg: 'bg-blue-50 border-blue-200',
            filter: 'all' as const,
          },
        ].map((s) => (
          <button
            key={s.label}
            onClick={() => setFilterStatus(filterStatus === s.filter ? 'all' : s.filter)}
            className={`${s.bg} border rounded-2xl p-4 text-right transition-all ${filterStatus === s.filter ? 'ring-2 ring-green-400 ring-offset-1' : ''}`}
          >
            <div className={s.color} style={{ fontSize: '26px', fontWeight: 800 }}>
              {s.value}
            </div>
            <div className={`${s.color} opacity-80`} style={{ fontSize: '12px', fontWeight: 600 }}>
              {s.label}
            </div>
          </button>
        ))}
      </div>

      {/* ── Bulk-export action bar ── */}
      {selectedBagIds.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-green-800" style={{ fontSize: '14px', fontWeight: 700 }}>
                {selectedBagIds.length}{' '}
                {selectedBagIds.length === 1 ? 'حقيبة محددة' : 'حقائب محددة للتصدير'}
              </p>
              <p className="text-green-600 font-mono" style={{ fontSize: '11px' }}>
                {selectedBagsData.map((b) => b.bagCode).join(' · ')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedBagIds([])}
              className="px-3 py-1.5 text-green-700 hover:bg-green-100 rounded-lg transition-all"
              style={{ fontSize: '12px', fontWeight: 600 }}
            >
              إلغاء التحديد
            </button>
            <button
              onClick={() => setExportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-sm"
              style={{ fontSize: '13px', fontWeight: 700 }}
            >
              <Upload className="w-4 h-4" />
              تصدير ({selectedBagIds.length})
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بكود الحقيبة أو الفصيلة..."
            className="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400"
            style={{ fontSize: '13px' }}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as BloodType | 'all')}
          className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-700 outline-none"
          style={{ fontSize: '13px' }}
        >
          <option value="all">كل الفصائل</option>
          {BLOOD_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3" style={{ width: '44px' }} />
                {[
                  'كود الحقيبة',
                  'الفصيلة',
                  'نوع الدم',
                  'تاريخ التسجيل',
                  'تاريخ الانتهاء',
                  'الحالة',
                  'إجراء',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-right text-gray-500"
                    style={{ fontSize: '12px', fontWeight: 600 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayBags.map((bag) => {
                const { label, cls, isExpired, isAvailable } = getBagStatus(bag);
                const days = daysUntil(bag.expiryDate);
                const isNear = isAvailable && days >= 0 && days <= 5;
                const isSelected = selectedBagIds.includes(bag.id);
                return (
                  <tr
                    key={bag.id}
                    className={`hover:bg-gray-50 transition-colors
                      ${isExpired ? 'bg-red-50/30' : ''}
                      ${isSelected ? 'bg-green-50/60' : ''}`}
                  >
                    {/* checkbox */}
                    <td className="px-4 py-3">
                      {isAvailable && (
                        <button
                          onClick={() => toggleSelect(bag.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                            ${
                              isSelected
                                ? 'bg-green-600 border-green-600'
                                : 'border-gray-300 hover:border-green-400'
                            }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="font-mono text-green-600 bg-green-50 px-2 py-0.5 rounded"
                          style={{ fontSize: '11px', fontWeight: 700 }}
                        >
                          {bag.bagCode}
                        </span>
                        {(isExpired || isNear) && (
                          <AlertTriangle
                            className={`w-3.5 h-3.5 ${isExpired ? 'text-red-500' : 'text-orange-400'}`}
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 bg-red-50 text-red-600 rounded"
                        style={{ fontSize: '12px', fontWeight: 800 }}
                      >
                        {bag.bloodType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600" style={{ fontSize: '12px' }}>
                      {donTypeLabels[bag.donationType]}
                    </td>
                    <td className="px-4 py-3 text-gray-600" style={{ fontSize: '12px' }}>
                      {bag.collectedDate}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`${isExpired ? 'text-red-600' : isNear ? 'text-orange-500' : 'text-gray-600'}`}
                        style={{
                          fontSize: '12px',
                          fontWeight: isExpired || isNear ? 700 : 400,
                        }}
                      >
                        {bag.expiryDate}
                        {isExpired && (
                          <span className="mr-1" style={{ fontSize: '10px' }}>
                            (منتهية)
                          </span>
                        )}
                        {isNear && (
                          <span className="mr-1" style={{ fontSize: '10px' }}>
                            ({days}د)
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full ${cls}`}
                        style={{ fontSize: '11px', fontWeight: 700 }}
                      >
                        {label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {isAvailable && (
                          <button
                            onClick={() => openExportForBag(bag)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all"
                            style={{ fontSize: '11px', fontWeight: 700 }}
                          >
                            <Upload className="w-3.5 h-3.5" /> تصدير
                          </button>
                        )}
                        {(isAvailable || isExpired || bag.status === 'rejected') && (
                          <button
                            onClick={() => setDisposeModal(bag)}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                              isExpired || bag.status === 'rejected'
                                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                            }`}
                            style={{ fontSize: '11px', fontWeight: 700 }}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> إتلاف
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {displayBags.length === 0 && <EmptyState colSpan={8} message="لا توجد حقائب" />}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Modal */}
      {exportModalOpen && (
        <ExportBagsModal
          selectedBagsData={selectedBagsData}
          isPending={exportBagsMutation.isPending}
          onConfirm={handleConfirmExport}
          onClose={() => {
            setExportModalOpen(false);
          }}
        />
      )}

      {/* Dispose Modal */}
      {disposeModal && (
        <DisposeBagModal
          bag={disposeModal}
          reason={disposeReason}
          isPending={disposeBagMutation.isPending}
          onReasonChange={setDisposeReason}
          onConfirm={handleDispose}
          onClose={() => {
            setDisposeModal(null);
            setDisposeReason('');
          }}
        />
      )}
    </div>
  );
}
