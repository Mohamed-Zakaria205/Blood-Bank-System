import { useState } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  X,
  FlaskConical,
  Filter,
  CreditCard,
} from 'lucide-react';
import { useTestResults, useSamples } from '../../hooks/useLabTests';
import { useDonors } from '../../hooks/useDonors';
import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';

// ── Sub-components ──
import { SCREENING_TESTS, buildCombinedList } from './lab-results/labResultsConstants';
import type { CombinedEntry } from './lab-results/labResultsConstants';
import ResultDetailModal from './lab-results/ResultDetailModal';

// ── Status badge helper ──
function getStatusBadge(entry: CombinedEntry) {
  if (entry.displayStatus === 'pending')
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full whitespace-nowrap"
        style={{
          background: 'rgba(251,191,36,0.12)',
          border: '1px solid rgba(251,191,36,0.3)',
          fontSize: '10px',
          fontWeight: 700,
          color: '#92400e',
        }}
      >
        <Clock className="w-3 h-3" />
        معلق
      </span>
    );
  if (entry.displayStatus === 'safe')
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full whitespace-nowrap"
        style={{
          background: 'rgba(74,222,128,0.1)',
          border: '1px solid rgba(74,222,128,0.25)',
          fontSize: '10px',
          fontWeight: 700,
          color: '#14532d',
        }}
      >
        <CheckCircle2 className="w-3 h-3" />
        آمن
      </span>
    );
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{
        background: 'rgba(248,113,113,0.1)',
        border: '1px solid rgba(248,113,113,0.25)',
        fontSize: '10px',
        fontWeight: 700,
        color: '#7f1d1d',
      }}
    >
      <XCircle className="w-3 h-3" />
      مرفوض
    </span>
  );
}

// ── Inline test result badge ──
function testBadge(val: 'negative' | 'positive' | null) {
  if (!val)
    return (
      <span className="text-yellow-400" style={{ fontSize: '14px' }}>
        —
      </span>
    );
  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${val === 'negative' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
      style={{ fontSize: '11px', fontWeight: 800 }}
    >
      {val === 'negative' ? '−' : '+'}
    </span>
  );
}

export default function LabResults() {
  const {
    data: testResultsData = [],
    isLoading: isLoadingResults,
    isError: isErrorResults,
    refetch: refetchResults,
  } = useTestResults();
  const {
    data: samplesData = [],
    isLoading: isLoadingSamples,
    isError: isErrorSamples,
    refetch: refetchSamples,
  } = useSamples();
  const { data: donorsData = [], isLoading: isLoadingDonors } = useDonors();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewEntry, setViewEntry] = useState<CombinedEntry | null>(null);

  const isLoading = isLoadingResults || isLoadingSamples || isLoadingDonors;
  const isError = isErrorResults || isErrorSamples;

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
        message="تعذر تحميل نتائج الفحوصات"
        onRetry={() => {
          refetchResults();
          refetchSamples();
        }}
      />
    );

  const allEntries = buildCombinedList(testResultsData, samplesData, donorsData);

  const filtered = allEntries.filter((r) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      r.sampleCode.toLowerCase().includes(q) ||
      r.donorCode.toLowerCase().includes(q) ||
      r.donorName.includes(search) ||
      r.sampleId.toLowerCase().includes(q) ||
      r.nationalId.includes(search);
    const matchFilter =
      filter === 'all' ||
      (filter === 'safe' && r.displayStatus === 'safe') ||
      (filter === 'unsafe' && r.displayStatus === 'unsafe') ||
      (filter === 'pending' && r.displayStatus === 'pending');
    return matchSearch && matchFilter;
  });

  const getRowBg = (entry: CombinedEntry) => {
    if (entry.displayStatus === 'pending') return 'rgba(251,191,36,0.06)';
    if (entry.displayStatus === 'unsafe') return 'rgba(248,113,113,0.05)';
    return '';
  };

  const totals = {
    all: allEntries.length,
    pending: allEntries.filter((r) => r.displayStatus === 'pending').length,
    safe: allEntries.filter((r) => r.displayStatus === 'safe').length,
    unsafe: allEntries.filter((r) => r.displayStatus === 'unsafe').length,
  };

  return (
    <div className="space-y-6">
      {viewEntry && <ResultDetailModal entry={viewEntry} onClose={() => setViewEntry(null)} />}

      {/* Page Header */}
      <div>
        <h1 className="text-gray-900" style={{ fontSize: '22px', fontWeight: 700 }}>
          نتائج الفحوصات
        </h1>
        <p className="text-gray-400 mt-1" style={{ fontSize: '13px' }}>
          سجل شامل لجميع العينات — الفحوصات: HCV · HBV · Syphilis · HIV
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي العينات', value: totals.all, icon: '🔬', btn: 'all', bg: 'bg-white border-gray-100' },
          {
            label: 'معلقة', value: totals.pending, icon: '⏳', btn: 'pending', bg: '',
            style: { background: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.25)' },
          },
          {
            label: 'آمنة', value: totals.safe, icon: '✅', btn: 'safe', bg: '',
            style: { background: 'rgba(74,222,128,0.08)', borderColor: 'rgba(74,222,128,0.25)' },
          },
          {
            label: 'مرفوضة', value: totals.unsafe, icon: '❌', btn: 'unsafe', bg: '',
            style: { background: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.25)' },
          },
        ].map((s, i) => (
          <button
            key={i}
            onClick={() => setFilter(s.btn)}
            className={`rounded-2xl p-4 border shadow-sm text-center hover:opacity-80 transition-all ${filter === s.btn ? 'ring-2 ring-green-400 ring-offset-1' : ''} ${s.bg}`}
            style={'style' in s ? s.style : undefined}
          >
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-gray-900" style={{ fontSize: '24px', fontWeight: 700 }}>
              {s.value}
            </div>
            <div className="text-gray-500" style={{ fontSize: '11px' }}>
              {s.label}
            </div>
          </button>
        ))}
      </div>

      {/* Tests Reference Strip */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <FlaskConical className="w-4 h-4 text-green-600" />
          <span className="text-green-800" style={{ fontSize: '13px', fontWeight: 700 }}>
            الفحوصات المعيارية — 4 تحاليل
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SCREENING_TESTS.map((t, i) => (
            <div
              key={t.key}
              className="bg-white rounded-xl px-3 py-2.5 border border-green-100 flex items-center gap-2.5"
            >
              <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white" style={{ fontSize: '8px', fontWeight: 900 }}>
                  {i + 1}
                </span>
              </div>
              <div>
                <p className="text-green-700" style={{ fontSize: '12px', fontWeight: 700 }}>
                  {t.abbr}
                </p>
                <p className="text-gray-500" style={{ fontSize: '10px' }}>
                  {t.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Color Legend */}
      <div className="flex flex-wrap gap-3">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border"
          style={{ background: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.25)' }}
        >
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="text-yellow-700" style={{ fontSize: '12px', fontWeight: 600 }}>
            معلق — لم يُفحص بعد
          </span>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border"
          style={{ background: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.25)' }}
        >
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-red-700" style={{ fontSize: '12px', fontWeight: 600 }}>
            مرفوض — نتيجة إيجابية
          </span>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border"
          style={{ background: 'rgba(74,222,128,0.08)', borderColor: 'rgba(74,222,128,0.25)' }}
        >
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-green-700" style={{ fontSize: '12px', fontWeight: 600 }}>
            آمن — جميع الفحوصات سالبة
          </span>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بكود العينة (= كود المتبرع) أو رقم الهوية أو اسم المتبرع..."
            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pr-10 pl-4 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 text-gray-900"
            style={{ fontSize: '13px' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 mt-3 flex-wrap items-center">
          <Filter className="w-4 h-4 text-gray-400" />
          {[
            { key: 'all', label: 'الكل', count: totals.all, activeBg: '#374151' },
            { key: 'pending', label: '⏳ معلق', count: totals.pending, activeBg: '#d97706' },
            { key: 'safe', label: '✅ آمن', count: totals.safe, activeBg: '#16a34a' },
            { key: 'unsafe', label: '❌ مرفوض', count: totals.unsafe, activeBg: '#dc2626' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className="px-3 py-1.5 rounded-xl border-2 transition-all"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                background: filter === tab.key ? tab.activeBg : 'white',
                color: filter === tab.key ? 'white' : '#374151',
                borderColor: filter === tab.key ? tab.activeBg : '#e5e7eb',
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <span className="text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>
            النتائج ({filtered.length})
          </span>
          {search && (
            <span className="text-gray-400" style={{ fontSize: '12px' }}>
              نتائج البحث عن: "<span className="text-green-600">{search}</span>"
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="text-right px-4 py-3.5 text-gray-500 whitespace-nowrap" style={{ fontSize: '11px', fontWeight: 700 }}>
                  <span className="flex items-center gap-1.5">
                    <FlaskConical className="w-3 h-3" />
                    كود العينة
                  </span>
                </th>
                <th className="text-right px-3 py-3.5 text-gray-500 whitespace-nowrap" style={{ fontSize: '11px', fontWeight: 600 }}>
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    رقم الهوية
                  </span>
                </th>
                <th className="text-right px-3 py-3.5 text-gray-500" style={{ fontSize: '11px', fontWeight: 600 }}>المتبرع</th>
                <th className="text-right px-3 py-3.5 text-gray-500" style={{ fontSize: '11px', fontWeight: 600 }}>الفصيلة</th>
                {SCREENING_TESTS.map((t) => (
                  <th key={t.key} className="text-center px-3 py-3.5 text-gray-500 whitespace-nowrap" style={{ fontSize: '11px', fontWeight: 700 }}>
                    {t.abbr}
                  </th>
                ))}
                <th className="text-right px-3 py-3.5 text-gray-500" style={{ fontSize: '11px', fontWeight: 600 }}>الحالة</th>
                <th className="text-right px-3 py-3.5 text-gray-500" style={{ fontSize: '11px', fontWeight: 600 }}>التاريخ</th>
                <th className="px-3 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                  style={{ background: getRowBg(entry) }}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <FlaskConical className="w-3 h-3 text-green-500 flex-shrink-0" />
                      <span
                        className="font-mono text-green-700 bg-green-50 px-2 py-0.5 rounded-lg border border-green-100"
                        style={{ fontSize: '11px', fontWeight: 700 }}
                      >
                        {entry.sampleCode}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="font-mono text-gray-600" style={{ fontSize: '11px' }}>
                        {entry.nationalId}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <div>
                      <div className="text-gray-900" style={{ fontSize: '12px', fontWeight: 600 }}>
                        {entry.donorName}
                      </div>
                      <div className="font-mono text-gray-400" style={{ fontSize: '10px' }}>
                        {entry.donorCode}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <span
                      className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg font-mono"
                      style={{ fontSize: '12px', fontWeight: 700 }}
                    >
                      {entry.confirmedBloodType || entry.bloodType}
                    </span>
                  </td>
                  {SCREENING_TESTS.map((t) => (
                    <td key={t.key} className="px-3 py-3.5 text-center">
                      {testBadge((entry as Record<string, unknown>)[t.key] as 'negative' | 'positive' | null)}
                    </td>
                  ))}
                  <td className="px-3 py-3.5">{getStatusBadge(entry)}</td>
                  <td className="px-3 py-3.5 text-gray-500 whitespace-nowrap" style={{ fontSize: '11px' }}>
                    {entry.date}
                  </td>
                  <td className="px-3 py-3.5">
                    <button
                      onClick={() => setViewEntry(entry)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-green-50"
                      style={{ background: 'rgba(22,163,74,0.07)' }}
                      title="عرض التفاصيل"
                    >
                      <Eye className="w-3.5 h-3.5 text-green-600" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <EmptyState
                  colSpan={11}
                  message={search ? `لا توجد نتائج لـ "${search}"` : 'لا توجد نتائج في هذه الفئة'}
                />
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
