
import {
  FlaskConical,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  Droplets,
  Activity,
  ChevronRight,
} from 'lucide-react';

import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { useLabDashboardData } from './hooks/useLabDashboardData';
import { useLabDashboardForm } from './hooks/useLabDashboardForm';

// ── Sub-components ──
import { screeningTests, donationTypeLabels } from './lab-dashboard/labConstants';
import ScreeningEntryModal from './lab-dashboard/ScreeningEntryModal';
import ViewResultModal from './lab-dashboard/ViewResultModal';

export default function LabDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    pending,
    completed,
    suitableCount,
    notSuitableCount,
    isLoading,
    isError,
  } = useLabDashboardData();

  const {
    activeTab,
    setActiveTab,
    entryModal,
    setEntryModal,
    viewModal,
    setViewModal,
    form,
    setForm,
    errors,
    submitting,
    successMsg,
    setSuccessMsg,
    openEntry,
    submitResult,
  } = useLabDashboardForm();

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
      <ErrorState message="فشل تحميل بيانات المختبر" onRetry={() => window.location.reload()} />
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: '22px', fontWeight: 800 }}>
            فحص حقائب الدم
          </h1>
          <p className="text-gray-500" style={{ fontSize: '14px' }}>
            مرحباً {user?.name} — الاثنين، 27 أبريل 2025
          </p>
        </div>
        <button
          onClick={() => navigate('/lab/samples')}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all text-sm"
          style={{ fontWeight: 600 }}
        >
          <FlaskConical className="w-4 h-4" /> فحص العينات
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Success notification */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-700" style={{ fontSize: '14px', fontWeight: 600 }}>
            {successMsg}
          </p>
          <button onClick={() => setSuccessMsg('')} className="mr-auto text-green-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'حقائب معلقة',
            value: pending.length,
            icon: Clock,
            color: 'text-yellow-600',
            bg: 'bg-yellow-50',
            border: 'border-yellow-100',
          },
          {
            label: 'مكتملة',
            value: completed.length,
            icon: CheckCircle2,
            color: 'text-green-600',
            bg: 'bg-green-50',
            border: 'border-green-100',
          },
          {
            label: 'آمنة ✅',
            value: suitableCount,
            icon: CheckCircle2,
            color: 'text-green-600',
            bg: 'bg-green-50',
            border: 'border-green-100',
          },
          {
            label: 'مرفوضة ❌',
            value: notSuitableCount,
            icon: XCircle,
            color: 'text-red-600',
            bg: 'bg-red-50',
            border: 'border-red-100',
          },
        ].map((s, i) => (
          <div key={i} className={`bg-white rounded-2xl p-5 border ${s.border} shadow-sm`}>
            <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center mb-4`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className="text-gray-900" style={{ fontSize: '30px', fontWeight: 800 }}>
              {s.value}
            </div>
            <div className="text-gray-600" style={{ fontSize: '13px', fontWeight: 500 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Blood Screening Tests Info */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-green-600" />
          <span className="text-green-800" style={{ fontSize: '13px', fontWeight: 700 }}>
            الفحوصات المعيارية المطلوبة لكل حقيبة دم
          </span>
          <span
            className="mr-auto px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full"
            style={{ fontSize: '11px', fontWeight: 700 }}
          >
            4 فحوصات
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {screeningTests.map((t, idx) => (
            <div
              key={t.key}
              className="bg-white rounded-xl px-4 py-3 border border-green-100 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white" style={{ fontSize: '8px', fontWeight: 900 }}>
                    {idx + 1}
                  </span>
                </div>
                <span className="text-green-700" style={{ fontSize: '13px', fontWeight: 800 }}>
                  {t.abbr}
                </span>
              </div>
              <p className="text-gray-700" style={{ fontSize: '11px', fontWeight: 600 }}>
                {t.label}
              </p>
              <p className="text-gray-400 mt-0.5" style={{ fontSize: '9px' }}>
                {t.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-wrap gap-3">
          <div className="flex rounded-xl bg-gray-100 p-1">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'pending' ? 'bg-white shadow-sm text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
              style={{
                fontSize: '13px',
                fontWeight: activeTab === 'pending' ? 700 : 500,
              }}
            >
              <Clock className="w-4 h-4" />
              معلقة
              {pending.length > 0 && (
                <span
                  className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded-full"
                  style={{ fontSize: '11px', fontWeight: 700 }}
                >
                  {pending.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'completed' ? 'bg-white shadow-sm text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
              style={{
                fontSize: '13px',
                fontWeight: activeTab === 'completed' ? 700 : 500,
              }}
            >
              <CheckCircle2 className="w-4 h-4" />
              مكتملة
              <span
                className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full"
                style={{ fontSize: '11px', fontWeight: 700 }}
              >
                {completed.length}
              </span>
            </button>
          </div>
        </div>

        {/* PENDING TESTS */}
        {activeTab === 'pending' && (
          <div>
            {pending.length === 0 ? (
              <div className="py-16 text-center">
                <Droplets className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400" style={{ fontSize: '15px' }}>
                  لا توجد حقائب معلقة 🎉
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {pending.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between px-5 py-4 hover:bg-yellow-50/40 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-yellow-100">
                        <span
                          className="text-yellow-700"
                          style={{ fontSize: '13px', fontWeight: 800 }}
                        >
                          {t.bloodType}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-gray-900"
                            style={{ fontSize: '14px', fontWeight: 700 }}
                          >
                            {t.donorName}
                          </span>
                          <span
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md"
                            style={{ fontSize: '11px' }}
                          >
                            {donationTypeLabels[t.donationType]}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 border border-green-100 rounded-lg">
                            <FlaskConical className="w-3 h-3 text-green-600" />
                            <span
                              className="text-green-700 font-mono"
                              style={{ fontSize: '11px', fontWeight: 700 }}
                            >
                              كود العينة: {t.donorCode}
                            </span>
                          </div>
                          <span className="text-gray-400" style={{ fontSize: '11px' }}>
                            {t.requestedAt}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full"
                        style={{ fontSize: '11px', fontWeight: 700 }}
                      >
                        <Clock className="w-3 h-3" />
                        معلق
                      </span>
                      <button
                        onClick={() => openEntry(t)}
                        className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl transition-all shadow-sm bg-green-600 hover:bg-green-700"
                        style={{ fontSize: '13px', fontWeight: 700 }}
                      >
                        <FlaskConical className="w-3.5 h-3.5" /> بدء الفحص
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* COMPLETED TESTS */}
        {activeTab === 'completed' && (
          <div>
            {completed.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-gray-400" style={{ fontSize: '15px' }}>
                  لا توجد حقائب مكتملة
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {completed.map((t) => (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between px-5 py-4 transition-colors border-b border-gray-50 last:border-0 ${t.result?.suitable ? 'hover:bg-green-50/20' : 'hover:bg-red-50/20'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${t.result?.suitable ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}
                      >
                        {t.result?.suitable ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-gray-900"
                            style={{ fontSize: '14px', fontWeight: 700 }}
                          >
                            {t.donorName}
                          </span>
                          <span
                            className="px-2 py-0.5 bg-gray-100 rounded-lg font-mono text-gray-600"
                            style={{ fontSize: '12px', fontWeight: 700 }}
                          >
                            {t.result?.confirmedBloodType || t.bloodType}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full ${t.result?.suitable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                            style={{ fontSize: '11px', fontWeight: 700 }}
                          >
                            {t.result?.suitable ? '✅ آمنة' : '❌ مرفوضة'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 border border-green-100 rounded-lg">
                            <FlaskConical className="w-3 h-3 text-green-600" />
                            <span
                              className="text-green-700 font-mono"
                              style={{ fontSize: '11px', fontWeight: 700 }}
                            >
                              كود العينة: {t.donorCode}
                            </span>
                          </div>
                          <span className="text-gray-400" style={{ fontSize: '11px' }}>
                            {t.result?.completedAt}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setViewModal(t)}
                      className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                      style={{ fontSize: '12px', fontWeight: 600 }}
                    >
                      عرض التفاصيل
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Entry Modal */}
      {entryModal && form && (
        <ScreeningEntryModal
          entryModal={entryModal}
          form={form}
          errors={errors}
          submitting={submitting}
          userName={user?.name}
          onClose={() => setEntryModal(null)}
          onUpdateForm={(updater) => setForm((prev) => (prev ? updater(prev) : prev))}
          onSubmit={submitResult}
        />
      )}

      {/* View Completed Modal */}
      {viewModal && (
        <ViewResultModal viewModal={viewModal} onClose={() => setViewModal(null)} />
      )}
    </div>
  );
}
