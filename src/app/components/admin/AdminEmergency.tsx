import { useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Phone, Clock, Droplets, X, Send } from 'lucide-react';
import { useEmergencyRequests, useFulfillEmergency, useRejectEmergency } from '../../hooks/useEmergency';
import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';
import type { EmergencyRequest } from '../../types/emergency';

const urgencyConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  critical: { label: 'طارئ جداً', color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-200' },
  high: { label: 'عالي', color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-200' },
  medium: { label: 'متوسط', color: 'text-yellow-700', bg: 'bg-yellow-100', border: 'border-yellow-200' },
};

function FulfillModal({ request, onClose, onSubmit }: { request: EmergencyRequest; onClose: () => void; onSubmit: (units: number, note: string) => void }) {
  const [units, setUnits] = useState(request.units);
  const [note, setNote] = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#C62828] to-[#B71C1C] p-6 flex items-center justify-between">
          <div>
            <h3 className="text-white" style={{ fontSize: '18px', fontWeight: 700 }}>تلبية الطلب الطارئ</h3>
            <p className="text-red-200" style={{ fontSize: '13px' }}>{request.hospital}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-[#C62828]" style={{ fontSize: '14px', fontWeight: 800 }}>{request.bloodType}</span>
              </div>
              <div>
                <div className="text-[#1E293B]" style={{ fontSize: '14px', fontWeight: 600 }}>الفصيلة المطلوبة: {request.bloodType}</div>
                <div className="text-gray-500" style={{ fontSize: '12px' }}>السبب: {request.reason}</div>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-[#374151] mb-1.5" style={{ fontSize: '14px', fontWeight: 600 }}>عدد الوحدات المرسلة</label>
            <input type="number" value={units} onChange={e => setUnits(Number(e.target.value))} min={1}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#C62828]" style={{ fontSize: '14px' }} />
          </div>
          <div>
            <label className="block text-[#374151] mb-1.5" style={{ fontSize: '14px', fontWeight: 600 }}>ملاحظات</label>
            <textarea rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="ملاحظات الشحن والتسليم..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#C62828] resize-none" style={{ fontSize: '14px' }} />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors" style={{ fontSize: '14px', fontWeight: 600 }}>إلغاء</button>
            <button onClick={() => onSubmit(units, note)} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#C62828] to-[#B71C1C] text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2" style={{ fontSize: '14px', fontWeight: 600 }}>
              <Send className="w-4 h-4" />إرسال الوحدات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminEmergency() {
  const { data: requests = [], isLoading, isError } = useEmergencyRequests();
  const fulfillMutation = useFulfillEmergency();
  const rejectMutation = useRejectEmergency();
  const [fulfillReq, setFulfillReq] = useState<EmergencyRequest | null>(null);

  if (isLoading) return (
    <div className="space-y-6 p-2">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
      <CardSkeleton count={3} />
      <TableSkeleton rows={5} cols={6} />
    </div>
  );
  if (isError) return <ErrorState message="فشل في تحميل طلبات الطوارئ، يرجى المحاولة لاحقاً" onRetry={() => window.location.reload()} />;

  const handleFulfill = (units: number, note: string) => {
    if (!fulfillReq) return;
    fulfillMutation.mutate(
      { requestId: fulfillReq.id, unitsSent: units, notes: note },
      { onSettled: () => setFulfillReq(null) },
    );
  };

  const handleReject = (id: number) => {
    rejectMutation.mutate(id);
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const criticalCount = requests.filter(r => r.urgency === 'critical').length;

  return (
    <div className="space-y-6">
      {fulfillReq && <FulfillModal request={fulfillReq} onClose={() => setFulfillReq(null)} onSubmit={handleFulfill} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#1E293B]" style={{ fontSize: '22px', fontWeight: 700 }}>طلبات الطوارئ</h1>
          <p className="text-gray-400 mt-1" style={{ fontSize: '13px' }}>إدارة الطلبات الطارئة من المستشفيات</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-2.5 rounded-xl">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-700" style={{ fontSize: '14px', fontWeight: 600 }}>{pendingCount} طلبات تنتظر المعالجة</span>
          </div>
        )}
      </div>

      {/* Emergency Alert */}
      {criticalCount > 0 && (
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-5 text-white flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div style={{ fontSize: '16px', fontWeight: 700 }}>🚨 تنبيه: {criticalCount} حالة طوارئ قصوى!</div>
            <div className="text-red-200" style={{ fontSize: '13px' }}>تتطلب استجابة فورية - يرجى مراجعة الطلبات أدناه</div>
          </div>
          <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-colors" style={{ fontSize: '14px', fontWeight: 600 }}>
            استجب الآن
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الطلبات', value: requests.length, icon: '📋', color: 'border-gray-100' },
          { label: 'قيد الانتظار', value: pendingCount, icon: '⏳', color: 'border-orange-100' },
          { label: 'طوارئ قصوى', value: criticalCount, icon: '🚨', color: 'border-red-100' },
          { label: 'تمت التلبية', value: requests.filter(r => r.status === 'fulfilled').length, icon: '✅', color: 'border-green-100' },
        ].map((s, i) => (
          <div key={i} className={`bg-white rounded-2xl p-5 border ${s.color} shadow-sm text-center`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-[#1E293B]" style={{ fontSize: '24px', fontWeight: 700 }}>{s.value}</div>
            <div className="text-gray-500" style={{ fontSize: '12px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {requests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="text-4xl">🏥</div>
          <p className="text-gray-500" style={{ fontSize: '14px', fontWeight: 600 }}>لا توجد طلبات طوارئ حالياً</p>
        </div>
      )}

      {/* Emergency Requests */}
      <div className="space-y-4">
        {requests.map((req) => {
          const config = urgencyConfig[req.urgency];
          const isPending = req.status === 'pending';
          return (
            <div key={req.id} className={`bg-white rounded-2xl border ${isPending ? config.border : 'border-gray-100'} shadow-sm overflow-hidden transition-all`}>
              <div className={`h-1 ${isPending ? (req.urgency === 'critical' ? 'bg-red-500' : req.urgency === 'high' ? 'bg-orange-500' : 'bg-yellow-500') : 'bg-gray-200'}`}></div>
              <div className="p-5">
                <div className="flex flex-wrap items-start gap-4">
                  {/* Blood Type */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${isPending ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <span className={`${isPending ? 'text-[#C62828]' : 'text-gray-400'}`} style={{ fontSize: '16px', fontWeight: 800 }}>{req.bloodType}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-[#1E293B]" style={{ fontSize: '16px', fontWeight: 700 }}>{req.hospital}</h3>
                      <span className={`px-2.5 py-1 rounded-full ${config.bg} ${config.color}`} style={{ fontSize: '12px', fontWeight: 600 }}>{config.label}</span>
                      <span className={`px-2.5 py-1 rounded-full ${isPending ? 'bg-yellow-100 text-yellow-700' : req.status === 'fulfilled' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} style={{ fontSize: '12px', fontWeight: 600 }}>
                        {isPending ? 'قيد الانتظار' : req.status === 'fulfilled' ? 'تمت التلبية' : 'مرفوض'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Droplets className="w-4 h-4 text-[#C62828]" />
                        <span style={{ fontSize: '13px' }}>{req.units} وحدات مطلوبة</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span style={{ fontSize: '13px' }}>{req.requestDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span style={{ fontSize: '13px' }}>{req.requester}</span>
                      </div>
                    </div>
                    <div className="mt-2 bg-gray-50 rounded-xl px-3 py-2 inline-flex items-center gap-2">
                      <span className="text-gray-400" style={{ fontSize: '12px' }}>السبب:</span>
                      <span className="text-[#374151]" style={{ fontSize: '13px', fontWeight: 600 }}>{req.reason}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {isPending && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setFulfillReq(req)}
                        disabled={fulfillMutation.isPending}
                        className="flex items-center gap-2 bg-gradient-to-r from-[#C62828] to-[#B71C1C] text-white px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-60"
                        style={{ fontSize: '13px', fontWeight: 600 }}
                      >
                        <CheckCircle2 className="w-4 h-4" />تلبية الطلب
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        disabled={rejectMutation.isPending}
                        className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-60"
                        style={{ fontSize: '13px', fontWeight: 600 }}
                      >
                        <XCircle className="w-4 h-4" />رفض
                      </button>
                    </div>
                  )}
                  {!isPending && (
                    <div className={`flex items-center gap-2 ${req.status === 'fulfilled' ? 'bg-green-100' : 'bg-red-100'} px-4 py-2.5 rounded-xl`}>
                      {req.status === 'fulfilled' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="text-green-700" style={{ fontSize: '13px', fontWeight: 600 }}>تمت التلبية</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-red-700" style={{ fontSize: '13px', fontWeight: 600 }}>مرفوض</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
