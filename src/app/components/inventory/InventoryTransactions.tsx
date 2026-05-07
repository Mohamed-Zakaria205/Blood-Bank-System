import { useState } from 'react';
import { Search, Download } from 'lucide-react';
import { BLOOD_TYPES } from '../../constants';
import type { BloodType, TransactionType } from '../../types';
import { useTransactions } from '../../hooks/useInventory';
import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';

const typeColors: Record<TransactionType, string> = {
  issue: 'bg-blue-100 text-blue-700',
  return: 'bg-green-100 text-green-700',
  disposal: 'bg-red-100 text-red-600',
  receive: 'bg-purple-100 text-purple-700',
  reserve: 'bg-orange-100 text-orange-600',
};
const typeLabels: Record<TransactionType, string> = {
  issue: 'صرف',
  return: 'إرجاع',
  disposal: 'إتلاف',
  receive: 'استلام',
  reserve: 'حجز',
};
const typeIcons: Record<TransactionType, string> = {
  issue: '↑',
  return: '↓',
  disposal: '✕',
  receive: '+',
  reserve: '⊡',
};

export default function InventoryTransactions() {
  const { data: transactions = [], isLoading, isError } = useTransactions();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [filterBlood, setFilterBlood] = useState<BloodType | 'all'>('all');

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
        message="فشل في تحميل العمليات، يرجى المحاولة لاحقاً"
        onRetry={() => window.location.reload()}
      />
    );

  const filtered = transactions.filter((t) => {
    const matchSearch =
      t.id.includes(search) ||
      t.bagCodes.some((c) => c.includes(search)) ||
      (t.destination ?? '').includes(search) ||
      t.performedByName.includes(search);
    const matchType = filterType === 'all' || t.type === filterType;
    const matchBlood = filterBlood === 'all' || t.bloodType === filterBlood;
    return matchSearch && matchType && matchBlood;
  });

  const counts = (['issue', 'return', 'disposal', 'receive', 'reserve'] as const).reduce(
    (acc, t) => { acc[t] = transactions.filter((x) => x.type === t).length; return acc; },
    {} as Record<TransactionType, number>,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: '22px', fontWeight: 800 }}>
            سجل العمليات
          </h1>
          <p className="text-gray-500" style={{ fontSize: '14px' }}>
            {transactions.length} عملية مسجلة
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
          style={{ fontSize: '13px', fontWeight: 600 }}
        >
          <Download className="w-4 h-4" /> تصدير
        </button>
      </div>

      {/* Type stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(['issue', 'return', 'disposal', 'receive', 'reserve'] as TransactionType[]).map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(filterType === t ? 'all' : t)}
            className={`p-3 rounded-xl border-2 text-right transition-all ${filterType === t ? typeColors[t] + ' border-current ring-2 ring-offset-1' : 'bg-white border-gray-100 hover:border-gray-200'}`}
          >
            <div className="text-gray-900" style={{ fontSize: '20px', fontWeight: 800 }}>
              {counts[t]}
            </div>
            <div className="text-gray-600" style={{ fontSize: '11px', fontWeight: 600 }}>
              {typeLabels[t]}
            </div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث برقم العملية أو كود الحقيبة..."
            className="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400"
            style={{ fontSize: '13px' }}
          />
        </div>
        <select
          value={filterBlood}
          onChange={(e) => setFilterBlood(e.target.value as BloodType | 'all')}
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

      {/* Transactions table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {[
                  'رقم العملية',
                  'النوع',
                  'الحقائب',
                  'الفصيلة',
                  'الكمية',
                  'الوجهة / السبب',
                  'المنفذ',
                  'الوقت',
                  'ملاحظات',
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
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span
                      className="font-mono text-green-600 bg-green-50 px-2 py-0.5 rounded"
                      style={{ fontSize: '11px', fontWeight: 700 }}
                    >
                      {t.id}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${typeColors[t.type]}`}
                      style={{ fontSize: '11px', fontWeight: 700 }}
                    >
                      <span>{typeIcons[t.type]}</span> {typeLabels[t.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {t.bagCodes.slice(0, 2).map((c) => (
                        <span
                          key={c}
                          className="font-mono text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded"
                          style={{ fontSize: '10px' }}
                        >
                          {c}
                        </span>
                      ))}
                      {t.bagCodes.length > 2 && (
                        <span className="text-gray-400" style={{ fontSize: '10px' }}>
                          +{t.bagCodes.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 bg-red-50 text-red-600 rounded"
                      style={{ fontSize: '12px', fontWeight: 800 }}
                    >
                      {t.bloodType}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 text-gray-700"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    {t.quantity}
                  </td>
                  <td className="px-4 py-3 text-gray-600" style={{ fontSize: '12px' }}>
                    {t.destination ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600" style={{ fontSize: '12px' }}>
                    {t.performedByName.split(' ').slice(1, 3).join(' ')}
                  </td>
                  <td
                    className="px-4 py-3 text-gray-400"
                    style={{ fontSize: '11px', whiteSpace: 'nowrap' }}
                  >
                    {t.timestamp}
                  </td>
                  <td
                    className="px-4 py-3 text-gray-400"
                    style={{ fontSize: '11px', maxWidth: '150px' }}
                  >
                    <span className="block truncate">{t.notes ?? '—'}</span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <EmptyState colSpan={9} message="لا توجد عمليات مسجلة" />}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
