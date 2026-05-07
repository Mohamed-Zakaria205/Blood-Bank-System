import { useState } from 'react';
import {
  History,
  Search,
  Upload,
  Trash2,
  Download,
  TrendingDown,
  Package,
  Eye,
  X,
  User,
  Phone,
  CreditCard,
  FileText,
  Clock,
  UserCheck,
} from 'lucide-react';
import { OutflowActionType, OutflowRecord, BloodType } from '../../types';
import { BLOOD_TYPES } from '../../constants';
import { useBloodBags, useOutflowRecords } from '../../hooks/useInventory';
import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';

const donTypeLabels: Record<string, string> = {
  whole: 'دم كامل',
  plasma: 'بلازما',
  platelets: 'صفائح',
};

function DetailModal({ record, onClose }: { record: OutflowRecord; onClose: () => void }) {
  const isExport = record.actionType === 'exported';
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 rounded-t-2xl border-b ${isExport ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${isExport ? 'bg-blue-100' : 'bg-red-100'}`}
            >
              {isExport ? (
                <Upload className="w-4 h-4 text-blue-600" />
              ) : (
                <Trash2 className="w-4 h-4 text-red-600" />
              )}
            </div>
            <div>
              <p
                className={`${isExport ? 'text-blue-700' : 'text-red-700'}`}
                style={{ fontSize: '15px', fontWeight: 700 }}
              >
                {isExport ? 'تفاصيل عملية التصدير' : 'تفاصيل عملية الإتلاف'}
              </p>
              <p className="text-gray-400" style={{ fontSize: '11px' }}>
                {record.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Bag info */}
          <div className="p-4 bg-gray-50 rounded-xl space-y-2">
            <p className="text-gray-500" style={{ fontSize: '11px', fontWeight: 600 }}>
              معلومات الحقيبة
            </p>
            <div className="flex items-center justify-between">
              <span className="text-gray-600" style={{ fontSize: '12px' }}>
                كود الحقيبة
              </span>
              <span
                className="font-mono text-gray-800 bg-gray-200 px-2 py-0.5 rounded"
                style={{ fontSize: '12px', fontWeight: 700 }}
              >
                {record.bagCode}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600" style={{ fontSize: '12px' }}>
                الفصيلة
              </span>
              <span
                className="px-2 py-0.5 bg-red-50 text-red-600 rounded"
                style={{ fontSize: '13px', fontWeight: 800 }}
              >
                {record.bloodType}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600" style={{ fontSize: '12px' }}>
                نوع الدم
              </span>
              <span className="text-gray-700" style={{ fontSize: '12px' }}>
                {donTypeLabels[record.donationType] ?? record.donationType}
              </span>
            </div>
          </div>

          {/* Recipient info (export only) */}
          {isExport && (
            <div className="space-y-3">
              <p className="text-gray-500" style={{ fontSize: '11px', fontWeight: 600 }}>
                بيانات المستلم
              </p>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-gray-500" style={{ fontSize: '11px' }}>
                    اسم المريض
                  </p>
                  <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                    {record.recipientName || '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CreditCard className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-gray-500" style={{ fontSize: '11px' }}>
                    الرقم القومي
                  </p>
                  <p
                    className="text-gray-900 font-mono"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    {record.nationalId || '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <p className="text-gray-500" style={{ fontSize: '11px' }}>
                    رقم الهاتف
                  </p>
                  <p
                    className="text-gray-900 font-mono"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    {record.phone || '—'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileText className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <p className="text-gray-500" style={{ fontSize: '11px' }}>
                {isExport ? 'سبب التصدير' : 'سبب الإتلاف'}
              </p>
              <p className="text-gray-800" style={{ fontSize: '13px' }}>
                {record.reason}
              </p>
            </div>
          </div>

          {/* Audit info */}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-gray-500" style={{ fontSize: '11px' }}>
                  المنفذ
                </p>
                <p className="text-gray-800" style={{ fontSize: '13px', fontWeight: 600 }}>
                  {record.performedByName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-gray-500" style={{ fontSize: '11px' }}>
                  التاريخ والوقت
                </p>
                <p
                  className="text-gray-800 font-mono"
                  style={{ fontSize: '13px', fontWeight: 600 }}
                >
                  {record.timestamp}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InventoryHistory() {
  const {
    data: outflowRecords = [],
    isLoading: isLoadingOutflow,
    isError: isErrorOutflow,
  } = useOutflowRecords();
  const { data: bags = [], isLoading: isLoadingBags, isError: isErrorBags } = useBloodBags();
  const [filterAction, setFilterAction] = useState<OutflowActionType | 'all'>('all');
  const [filterController, setFilterController] = useState('');
  const [filterBloodType, setFilterBloodType] = useState<BloodType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [detailRecord, setDetailRecord] = useState<OutflowRecord | null>(null);

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
        message="فشل في تحميل سجل الصادر، يرجى المحاولة لاحقاً"
        onRetry={() => window.location.reload()}
      />
    );

  const controllers = [...new Set(outflowRecords.map((r) => r.performedByName))];

  const filtered = outflowRecords.filter((r) => {
    if (filterAction !== 'all' && r.actionType !== filterAction) return false;
    if (filterController && r.performedByName !== filterController) return false;
    if (filterBloodType !== 'all' && r.bloodType !== filterBloodType) return false;
    if (
      search &&
      !r.bagCode.includes(search) &&
      !r.bloodType.includes(search) &&
      !(r.recipientName ?? '').includes(search)
    )
      return false;
    return true;
  });

  const totalExported = outflowRecords.filter((r) => r.actionType === 'exported').length;
  const totalDisposed = outflowRecords.filter((r) => r.actionType === 'disposed').length;
  const availableNow = bags.filter((b) => b.status === 'available').length;
  const total = availableNow + totalExported + totalDisposed;
  const expiredRatio = total > 0 ? Math.round((totalDisposed / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {detailRecord && <DetailModal record={detailRecord} onClose={() => setDetailRecord(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: '22px', fontWeight: 800 }}>
            سجل الصادر
          </h1>
          <p className="text-gray-500" style={{ fontSize: '14px' }}>
            {outflowRecords.length} عملية مسجلة (تصدير + إتلاف)
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
          style={{ fontSize: '13px', fontWeight: 600 }}
        >
          <Download className="w-4 h-4" /> تصدير التقرير
        </button>
      </div>

      {/* Insights panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'إجمالي الحقائب الفعّالة',
            value: availableNow,
            icon: Package,
            color: 'text-green-600',
            bg: 'bg-green-50 border-green-100',
          },
          {
            label: 'مُصدَّرة',
            value: totalExported,
            icon: Upload,
            color: 'text-blue-600',
            bg: 'bg-blue-50 border-blue-100',
          },
          {
            label: 'مُتلَفة',
            value: totalDisposed,
            icon: Trash2,
            color: 'text-red-600',
            bg: 'bg-red-50 border-red-100',
          },
          {
            label: 'نسبة الهدر',
            value: `${expiredRatio}%`,
            icon: TrendingDown,
            color: expiredRatio > 20 ? 'text-red-600' : 'text-orange-500',
            bg: expiredRatio > 20 ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100',
          },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} border rounded-2xl p-5 shadow-sm`}>
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className={s.color} style={{ fontSize: '26px', fontWeight: 800 }}>
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

      {/* Ratio bar */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-700" style={{ fontSize: '14px', fontWeight: 700 }}>
            نسبة التوزيع الكلي
          </span>
          <span className="text-gray-500" style={{ fontSize: '12px' }}>
            إجمالي: {total} حقيبة
          </span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          <div
            className="bg-green-500 rounded-r-full"
            style={{
              width: `${total > 0 ? (availableNow / total) * 100 : 0}%`,
            }}
            title="متاح"
          />
          <div
            className="bg-blue-500"
            style={{
              width: `${total > 0 ? (totalExported / total) * 100 : 0}%`,
            }}
            title="مُصدَّر"
          />
          <div
            className="bg-red-500 rounded-l-full"
            style={{
              width: `${total > 0 ? (totalDisposed / total) * 100 : 0}%`,
            }}
            title="مُتلَف"
          />
        </div>
        <div className="flex items-center gap-4 mt-2">
          {[
            { color: 'bg-green-500', label: `متاح (${availableNow})` },
            { color: 'bg-blue-500', label: `مُصدَّر (${totalExported})` },
            { color: 'bg-red-500', label: `مُتلَف (${totalDisposed})` },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
              <span className="text-gray-500" style={{ fontSize: '11px' }}>
                {l.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بكود الحقيبة أو الفصيلة أو المستلم..."
              className="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400"
              style={{ fontSize: '13px' }}
            />
          </div>
          <select
            value={filterBloodType}
            onChange={(e) => setFilterBloodType(e.target.value as any)}
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

        <div className="flex flex-wrap gap-2 items-center">
          {(
            [
              ['all', 'الكل'],
              ['exported', 'تصدير فقط'],
              ['disposed', 'إتلاف فقط'],
            ] as [OutflowActionType | 'all', string][]
          ).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilterAction(val)}
              className={`px-4 py-2 rounded-xl transition-all ${filterAction === val ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              {label}
            </button>
          ))}
          {controllers.length > 1 && (
            <select
              value={filterController}
              onChange={(e) => setFilterController(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-gray-700 outline-none"
              style={{ fontSize: '13px' }}
            >
              <option value="">كل المنفذين</option>
              {controllers.map((c) => (
                <option key={c} value={c}>
                  {c.split(' ').slice(1, 3).join(' ')}
                </option>
              ))}
            </select>
          )}
          {(filterAction !== 'all' || filterController || filterBloodType !== 'all' || search) && (
            <button
              onClick={() => {
                setFilterAction('all');
                setFilterController('');
                setFilterBloodType('all');
                setSearch('');
              }}
              className="px-3 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-200 rounded-xl transition-all"
              style={{ fontSize: '12px', fontWeight: 600 }}
            >
              × مسح الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {[
                  'رقم السجل',
                  'كود الحقيبة',
                  'الفصيلة',
                  'النوع',
                  'المستلم',
                  'المنفذ',
                  'التاريخ',
                  'التفاصيل',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-right text-gray-500 whitespace-nowrap"
                    style={{ fontSize: '11px', fontWeight: 600 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="font-mono text-green-600 bg-green-50 px-2 py-0.5 rounded"
                      style={{ fontSize: '11px', fontWeight: 700 }}
                    >
                      {r.id}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded"
                      style={{ fontSize: '11px' }}
                    >
                      {r.bagCode}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 bg-red-50 text-red-600 rounded"
                      style={{ fontSize: '12px', fontWeight: 800 }}
                    >
                      {r.bloodType}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full ${r.actionType === 'exported' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-600'}`}
                      style={{ fontSize: '11px', fontWeight: 700 }}
                    >
                      {r.actionType === 'exported' ? (
                        <>
                          <Upload className="w-3 h-3" /> تصدير
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3 h-3" /> إتلاف
                        </>
                      )}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 text-gray-700 whitespace-nowrap"
                    style={{ fontSize: '12px', fontWeight: 500 }}
                  >
                    {r.recipientName ?? '—'}
                  </td>
                  <td
                    className="px-4 py-3 text-gray-600 whitespace-nowrap"
                    style={{ fontSize: '11px' }}
                  >
                    {r.performedByName.split(' ').slice(1, 3).join(' ')}
                  </td>
                  <td
                    className="px-4 py-3 text-gray-400 whitespace-nowrap"
                    style={{ fontSize: '11px' }}
                  >
                    {r.timestamp}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDetailRecord(r)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all"
                      style={{ fontSize: '11px', fontWeight: 600 }}
                    >
                      <Eye className="w-3.5 h-3.5" /> عرض
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <EmptyState colSpan={8} message="لا توجد سجلات" />}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
