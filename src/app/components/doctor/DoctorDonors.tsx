import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  UserPlus,
  Search,
  Eye,
  ChevronDown,
  Building2,
  Smartphone,
  Megaphone,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { BLOOD_TYPES, CITIES } from '../../constants';
import { useDonors } from '../../hooks/useDonors';
import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import type { Donor } from '../../types';

// ── Sub-components ──
import {
  statusColors,
  statusLabels,
  donationTypeLabels,
  genderLabels,
  tableHeaders,
} from './doctor-donors/donorsConstants';
import DonorDetailModal from './doctor-donors/DonorDetailModal';

export default function DoctorDonors() {
  const navigate = useNavigate();
  const { data: donors = [], isLoading, isError, refetch } = useDonors();
  const [search, setSearch] = useState('');
  const [filterBlood, setFilterBlood] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [viewing, setViewing] = useState<Donor | null>(null);

  if (isLoading)
    return (
      <div className="space-y-6 p-2">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <CardSkeleton count={3} />
        <TableSkeleton rows={7} cols={10} />
      </div>
    );
  if (isError)
    return <ErrorState message="تعذر تحميل بيانات المتبرعين" onRetry={() => refetch()} />;

  const filtered = donors.filter((d) => {
    const matchSearch =
      d.name.includes(search) || d.donorCode.includes(search) || d.phone.includes(search);
    const matchBlood = !filterBlood || d.bloodType === filterBlood;
    const matchStatus = !filterStatus || d.status === filterStatus;
    const matchCity = !filterCity || d.city === filterCity;
    return matchSearch && matchBlood && matchStatus && matchCity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: '22px', fontWeight: 800 }}>
            المتبرعون
          </h1>
          <p className="text-gray-500" style={{ fontSize: '14px' }}>
            {donors.length} متبرع مسجل
          </p>
        </div>
        <button
          onClick={() => navigate('/doctor/register')}
          className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl transition-all shadow-sm"
          style={{
            background: 'linear-gradient(135deg, #15803d, #16a34a)',
            fontSize: '14px',
            fontWeight: 700,
          }}
        >
          <UserPlus className="w-5 h-5" /> تسجيل متبرع جديد
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بلاسم أو الرمز..."
              className="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
              style={{ fontSize: '13px' }}
            />
          </div>
          <div className="relative">
            <select
              value={filterBlood}
              onChange={(e) => setFilterBlood(e.target.value)}
              className="w-full pr-4 pl-8 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-gray-50 outline-none focus:border-green-400 appearance-none"
              style={{ fontSize: '13px' }}
            >
              <option value="">كل الفصائل</option>
              {BLOOD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pr-4 pl-8 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-gray-50 outline-none focus:border-green-400 appearance-none"
              style={{ fontSize: '13px' }}
            >
              <option value="">كل الحالات</option>
              <option value="eligible">مؤهل</option>
              <option value="ineligible">غير مؤهل</option>
              <option value="deferred">موجل لفترة</option>
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="w-full pr-4 pl-8 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-gray-50 outline-none focus:border-green-400 appearance-none"
              style={{ fontSize: '13px' }}
            >
              <option value="">كل المدن</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'مؤهلون',
            count: donors.filter((d) => d.status === 'eligible').length,
            color: 'text-green-600',
            bg: 'bg-green-50',
          },
          {
            label: 'موجلون',
            count: donors.filter((d) => d.status === 'deferred').length,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
          },
          {
            label: 'غير مؤهلين',
            count: donors.filter((d) => d.status === 'ineligible').length,
            color: 'text-red-600',
            bg: 'bg-red-50',
          },
        ].map((_s, _i) => null)}
      </div>

      {/* Donors Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <span className="text-gray-500" style={{ fontSize: '13px' }}>
            {filtered.length} نتيجة
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px]">
            <thead>
              <tr className="bg-gray-50">
                {tableHeaders.map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-right text-gray-500 whitespace-nowrap"
                    style={{ fontSize: '12px', fontWeight: 600 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {d.status === 'eligible' ? (
                      <span
                        className="font-mono text-green-600 bg-green-50 px-2 py-0.5 rounded"
                        style={{ fontSize: '11px', fontWeight: 700 }}
                      >
                        {d.donorCode}
                      </span>
                    ) : (
                      <span
                        className="text-gray-300 bg-gray-50 px-2 py-0.5 rounded border border-dashed border-gray-200"
                        style={{ fontSize: '11px' }}
                      >
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-gray-900" style={{ fontSize: '13px', fontWeight: 600 }}>
                      {d.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-gray-500" style={{ fontSize: '13px' }}>
                      {genderLabels[d.gender]}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="text-gray-700 font-mono"
                      style={{ fontSize: '12px' }}
                      dir="ltr"
                    >
                      {d.phone}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-gray-500" style={{ fontSize: '13px' }}>
                      {d.city}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="px-2 py-0.5 bg-red-50 text-red-600 rounded"
                      style={{ fontSize: '12px', fontWeight: 700 }}
                    >
                      {d.bloodType}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-gray-500" style={{ fontSize: '12px' }}>
                      {donationTypeLabels[d.donationType]}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {d.source === 'app' ? (
                      <span
                        className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full w-fit"
                        style={{ fontSize: '11px', fontWeight: 700 }}
                      >
                        <Smartphone className="w-3 h-3" /> من التطبيق
                      </span>
                    ) : d.source === 'campaign' ? (
                      <span
                        className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-full w-fit"
                        style={{ fontSize: '11px', fontWeight: 700 }}
                      >
                        <Megaphone className="w-3 h-3" /> من حملة
                      </span>
                    ) : (
                      <span
                        className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full w-fit"
                        style={{ fontSize: '11px', fontWeight: 700 }}
                      >
                        <Building2 className="w-3 h-3" /> داخل البنك
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      <span
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full w-fit ${statusColors[d.status]}`}
                        style={{ fontSize: '11px', fontWeight: 600 }}
                      >
                        {d.status === 'eligible' && <CheckCircle2 className="w-3 h-3" />}
                        {d.status === 'ineligible' && <XCircle className="w-3 h-3" />}
                        {d.status === 'deferred' && <Clock className="w-3 h-3" />}
                        {statusLabels[d.status]}
                      </span>
                      {d.status === 'deferred' && d.deferredUntil && (
                        <span
                          className="text-orange-500 flex items-center gap-0.5"
                          style={{ fontSize: '10px' }}
                        >
                          <Clock className="w-3 h-3" /> حتى {d.deferredUntil}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => setViewing(d)}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <EmptyState colSpan={10} message="لا توجد نتائج" />}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {viewing && <DonorDetailModal donor={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
