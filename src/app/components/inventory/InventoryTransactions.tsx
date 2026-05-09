import { useState } from 'react';
import { Search, Download } from 'lucide-react';
import { BLOOD_TYPES } from '../../constants';
import type { BloodType, TransactionType } from '../../types';
import { useFilteredTransactions } from '../../hooks/useInventory';
import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';

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
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | ''>('');
  const [filterBlood, setFilterBlood] = useState<BloodType | ''>('');

  const {
    data: response,
    isLoading,
    isError,
  } = useFilteredTransactions({
    page,
    limit: 10,
    search,
    type: filterType,
    bloodType: filterBlood,
  });

  const transactions = response?.data || [];
  const total = response?.total || 0;
  const totalPages = Math.ceil(total / 10) || 1;

  const handleFilterChange = (setter: any, value: any) => {
    setter(value);
    setPage(1);
  };

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
            {total} عملية مسجلة
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
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <button
          onClick={() => handleFilterChange(setFilterType, '')}
          className={`p-3 rounded-xl border-2 text-right transition-all ${filterType === '' ? 'bg-gray-100 text-gray-900 border-gray-300 ring-2 ring-offset-1 ring-gray-400' : 'bg-white border-gray-100 hover:border-gray-200'}`}
        >
          <div className="text-gray-900" style={{ fontSize: '20px', fontWeight: 800 }}>
            الكل
          </div>
          <div className="text-gray-600" style={{ fontSize: '11px', fontWeight: 600 }}>
            جميع العمليات
          </div>
        </button>
        {(['issue', 'return', 'disposal', 'receive', 'reserve'] as TransactionType[]).map((t) => (
          <button
            key={t}
            onClick={() => handleFilterChange(setFilterType, t)}
            className={`p-3 rounded-xl border-2 text-right transition-all ${filterType === t ? typeColors[t] + ' border-current ring-2 ring-offset-1' : 'bg-white border-gray-100 hover:border-gray-200'}`}
          >
            <div className="text-gray-900" style={{ fontSize: '20px', fontWeight: 800 }}>
              {typeIcons[t]}
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
            onChange={(e) => handleFilterChange(setSearch, e.target.value)}
            placeholder="بحث برقم العملية أو كود الحقيبة..."
            className="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400"
            style={{ fontSize: '13px' }}
          />
        </div>
        <select
          value={filterBlood}
          onChange={(e) => handleFilterChange(setFilterBlood, e.target.value as BloodType | '')}
          className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-700 outline-none"
          style={{ fontSize: '13px' }}
        >
          <option value="">كل الفصائل</option>
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
              {transactions.map((t) => (
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
              {transactions.length === 0 && <EmptyState colSpan={9} message="لا توجد عمليات مسجلة" />}
            </tbody>
          </table>
        </div>
        
        {/* Pagination UI */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-center bg-gray-50">
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
      </div>
    </div>
  );
}
