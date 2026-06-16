import { Search } from 'lucide-react';
import type { BloodType } from '../../../types';
import type { OutflowRecord } from '../../../types';
import { BLOOD_TYPES } from '../../../constants';
import { EmptyState } from '../../shared/EmptyState';
import { DISPOSAL_REASONS, donTypeLabels, getCategoryLabel } from './disposalConstants';

interface DisposalHistoryProps {
  disposalRecords: OutflowRecord[];
  filteredHistory: OutflowRecord[];
  staffList: string[];
  histSearch: string;
  histCategory: string;
  histBloodType: BloodType | 'all';
  histStaff: string;
  hasHistFilters: boolean;
  onHistSearchChange: (v: string) => void;
  onHistCategoryChange: (v: string) => void;
  onHistBloodTypeChange: (v: BloodType | 'all') => void;
  onHistStaffChange: (v: string) => void;
  onClearFilters: () => void;
}

export default function DisposalHistory({
  disposalRecords,
  filteredHistory,
  staffList,
  histSearch,
  histCategory,
  histBloodType,
  histStaff,
  hasHistFilters,
  onHistSearchChange,
  onHistCategoryChange,
  onHistBloodTypeChange,
  onHistStaffChange,
  onClearFilters,
}: DisposalHistoryProps) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* History header */}
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-foreground" style={{ fontSize: '16px', fontWeight: 700 }}>
          سجل الإتلاف الكامل
        </h2>
        <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
          {disposalRecords.length} عملية إتلاف مسجلة
        </p>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-border space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={histSearch}
              onChange={(e) => onHistSearchChange(e.target.value)}
              placeholder="بحث بكود الحقيبة أو المنفذ..."
              className="w-full pr-9 pl-4 py-2.5 border border-border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400"
              style={{ fontSize: '13px' }}
            />
          </div>
          <select
            value={histBloodType}
            onChange={(e) => onHistBloodTypeChange(e.target.value as BloodType | 'all')}
            className="px-4 py-2.5 border border-border rounded-xl bg-card text-foreground outline-none"
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
          <select
            value={histCategory}
            onChange={(e) => onHistCategoryChange(e.target.value)}
            className="px-3 py-2 border border-border rounded-xl bg-card text-foreground outline-none"
            style={{ fontSize: '13px' }}
          >
            <option value="all">كل الأسباب</option>
            {DISPOSAL_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          {staffList.length > 1 && (
            <select
              value={histStaff}
              onChange={(e) => onHistStaffChange(e.target.value)}
              className="px-3 py-2 border border-border rounded-xl bg-card text-foreground outline-none"
              style={{ fontSize: '13px' }}
            >
              <option value="">كل المنفذين</option>
              {staffList.map((s) => (
                <option key={s} value={s}>
                  {s.split(' ').slice(1, 3).join(' ')}
                </option>
              ))}
            </select>
          )}
          {hasHistFilters && (
            <button
              onClick={onClearFilters}
              className="px-3 py-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 border border-border rounded-xl transition-all"
              style={{ fontSize: '12px', fontWeight: 600 }}
            >
              × مسح الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/40">
              {[
                'رقم السجل',
                'كود الحقيبة',
                'الفصيلة',
                'النوع',
                'سبب الإتلاف',
                'الحالة',
                'ملاحظات',
                'المنفذ',
                'التاريخ',
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-right text-muted-foreground whitespace-nowrap"
                  style={{ fontSize: '11px', fontWeight: 600 }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredHistory.map((r) => {
              const catLabel = getCategoryLabel(r.disposalCategory);
              return (
                <tr key={r.id} className="hover:bg-red-50/20 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="font-mono text-red-600 bg-red-50 px-2 py-0.5 rounded"
                      style={{ fontSize: '11px', fontWeight: 700 }}
                    >
                      {r.id}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded"
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
                  <td
                    className="px-4 py-3 text-muted-foreground whitespace-nowrap"
                    style={{ fontSize: '11px' }}
                  >
                    {donTypeLabels[r.donationType] ?? r.donationType}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-orange-50 border border-orange-100 text-orange-700 rounded-full"
                      style={{ fontSize: '11px', fontWeight: 600 }}
                    >
                      {DISPOSAL_REASONS.find((d) => d.value === r.disposalCategory)?.icon ?? '📋'}{' '}
                      {catLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground"
                      style={{ fontSize: '11px', fontWeight: 600 }}
                    >
                      مُتلَف
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 text-muted-foreground max-w-xs truncate"
                    style={{ fontSize: '11px' }}
                  >
                    {r.notes || '—'}
                  </td>
                  <td
                    className="px-4 py-3 text-muted-foreground whitespace-nowrap"
                    style={{ fontSize: '11px' }}
                  >
                    {(r.performedByName || '').split(' ').slice(1, 3).join(' ')}
                  </td>
                  <td
                    className="px-4 py-3 text-muted-foreground whitespace-nowrap"
                    style={{ fontSize: '11px' }}
                  >
                    {r.timestamp}
                  </td>
                </tr>
              );
            })}
            {filteredHistory.length === 0 && (
              <EmptyState
                colSpan={9}
                message={hasHistFilters ? 'لا توجد سجلات مطابقة للبحث' : 'لا توجد سجلات إتلاف'}
              />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
