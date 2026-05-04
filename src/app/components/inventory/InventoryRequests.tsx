import { useState } from 'react';
import { Building2, CheckCircle, X, Package, AlertTriangle, Search, Plus } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';
import { BloodBag, HOSPITALS, BLOOD_TYPES, BloodType } from '../../data/mockData';

const urgencyColors: Record<string, string> = {
  normal: 'bg-blue-100 text-blue-700',
  urgent: 'bg-orange-100 text-orange-700',
  emergency: 'bg-red-100 text-red-700',
};
const urgencyLabels: Record<string, string> = { normal: 'عادي', urgent: 'عاجل', emergency: 'طارئ' };
const statusColors: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  approved:  'bg-blue-100 text-blue-700',
  fulfilled: 'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-600',
};
const statusLabels: Record<string, string> = { pending: 'قيد المراجعة', approved: 'معتمد', fulfilled: 'تم الصرف', rejected: 'مرفوض' };

export default function InventoryRequests() {
  const { bags, requests, fulfillRequest, updateRequestStatus, addRequest } = useInventory();
  const [fulfillModal, setFulfillModal] = useState<string | null>(null);
  const [selectedBags, setSelectedBags] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'fulfilled'>('all');
  const [search, setSearch] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [newReq, setNewReq] = useState({ hospitalName: '', bloodType: 'O+' as BloodType, quantity: 1, urgency: 'normal' as any, notes: '' });

  const filtered = requests.filter(r => {
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchSearch = r.hospitalName.includes(search) || r.bloodType.includes(search);
    return matchStatus && matchSearch;
  });

  const getCompatibleBags = (bloodType: BloodType): BloodBag[] =>
    bags.filter(b => b.bloodType === bloodType && b.status === 'available');

  const currentReq = requests.find(r => r.id === fulfillModal);
  const compatibleBags = currentReq ? getCompatibleBags(currentReq.bloodType) : [];

  const handleFulfill = () => {
    if (!fulfillModal || selectedBags.length === 0) return;
    fulfillRequest(fulfillModal, selectedBags);
    setFulfillModal(null);
    setSelectedBags([]);
  };

  const handleAddRequest = () => {
    addRequest({ ...newReq, requestedAt: new Date().toLocaleString('ar-EG'), status: 'pending' });
    setAddModal(false);
    setNewReq({ hospitalName: '', bloodType: 'O+', quantity: 1, urgency: 'normal', notes: '' });
  };

  const pending = requests.filter(r => r.status === 'pending').length;
  const approved = requests.filter(r => r.status === 'approved').length;
  const fulfilled = requests.filter(r => r.status === 'fulfilled').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: '22px', fontWeight: 800 }}>طلبات المستشفيات</h1>
          <p className="text-gray-500" style={{ fontSize: '14px' }}>{approved} طلب معتمد جاهز للصرف</p>
        </div>
        <button onClick={() => setAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl transition-all"
          style={{ background: 'linear-gradient(135deg, #15803d, #16a34a)', fontSize: '14px', fontWeight: 700 }}>
          <Plus className="w-4 h-4" /> طلب جديد
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'قيد المراجعة', value: pending, color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
          { label: 'معتمد - جاهز', value: approved, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
          { label: 'تم الصرف', value: fulfilled, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} border rounded-2xl p-4`}>
            <div className={s.color} style={{ fontSize: '26px', fontWeight: 800 }}>{s.value}</div>
            <div className={`${s.color} opacity-80`} style={{ fontSize: '13px', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالمستشفى أو الفصيلة..."
            className="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400" style={{ fontSize: '13px' }} />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'fulfilled'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl transition-all ${filterStatus === s ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              style={{ fontSize: '13px', fontWeight: 600 }}>
              {s === 'all' ? 'الكل' : statusLabels[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Requests list */}
      <div className="space-y-3">
        {filtered.map(req => {
          const compat = getCompatibleBags(req.bloodType);
          const canFulfill = req.status === 'approved';
          const hasStock = compat.length >= req.quantity;
          return (
            <div key={req.id} className={`bg-white rounded-2xl p-5 border shadow-sm ${req.urgency === 'emergency' ? 'border-red-200' : req.urgency === 'urgent' ? 'border-orange-200' : 'border-gray-100'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${req.urgency === 'emergency' ? 'bg-red-50' : req.urgency === 'urgent' ? 'bg-orange-50' : 'bg-blue-50'}`}>
                    <Building2 className={`w-6 h-6 ${req.urgency === 'emergency' ? 'text-red-600' : req.urgency === 'urgent' ? 'text-orange-600' : 'text-blue-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-gray-900" style={{ fontSize: '15px', fontWeight: 700 }}>{req.hospitalName}</p>
                      <span className={`px-2 py-0.5 rounded-full ${urgencyColors[req.urgency]}`} style={{ fontSize: '11px', fontWeight: 700 }}>{urgencyLabels[req.urgency]}</span>
                      <span className={`px-2 py-0.5 rounded-full ${statusColors[req.status]}`} style={{ fontSize: '11px', fontWeight: 700 }}>{statusLabels[req.status]}</span>
                    </div>
                    <p className="text-gray-600 mb-1" style={{ fontSize: '13px' }}>
                      فصيلة <span className="text-red-600" style={{ fontWeight: 800 }}>{req.bloodType}</span> — {req.quantity} وحدة
                      <span className="mx-2 text-gray-300">|</span>
                      متاح في المخزون: <span className={`${hasStock ? 'text-green-600' : 'text-red-600'}`} style={{ fontWeight: 700 }}>{compat.length} حقيبة</span>
                    </p>
                    {req.notes && <p className="text-gray-400" style={{ fontSize: '12px' }}>{req.notes}</p>}
                    <p className="text-gray-400 mt-1" style={{ fontSize: '11px' }}>#{req.id} • {req.requestedAt}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {canFulfill && (
                    hasStock ? (
                      <button onClick={() => { setFulfillModal(req.id); setSelectedBags([]); }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
                        style={{ fontSize: '13px', fontWeight: 700 }}>
                        <Package className="w-4 h-4" /> صرف الطلب
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-100 rounded-xl">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-red-600" style={{ fontSize: '12px', fontWeight: 600 }}>مخزون غير كافٍ</span>
                      </div>
                    )
                  )}
                  {req.status === 'fulfilled' && (
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-green-50 rounded-xl">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-700" style={{ fontSize: '12px', fontWeight: 600 }}>تم الصرف</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
            <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400" style={{ fontSize: '14px' }}>لا توجد طلبات</p>
          </div>
        )}
      </div>

      {/* Fulfill modal */}
      {fulfillModal && currentReq && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h3 className="text-gray-900 mb-1" style={{ fontSize: '18px', fontWeight: 700 }}>صرف طلب {currentReq.hospitalName}</h3>
            <p className="text-gray-500 mb-4" style={{ fontSize: '13px' }}>
              مطلوب: {currentReq.quantity} وحدة {currentReq.bloodType} — حدد الحقائب المناسبة
            </p>
            {selectedBags.length > 0 && (
              <div className="mb-3 p-2 bg-green-50 border border-green-100 rounded-xl">
                <p className="text-green-700" style={{ fontSize: '12px', fontWeight: 600 }}>
                  محدد: {selectedBags.length} / {currentReq.quantity} وحدة
                  {selectedBags.length >= currentReq.quantity && ' ✓ جاهز للصرف'}
                </p>
              </div>
            )}
            <div className="space-y-2 max-h-72 overflow-y-auto mb-5">
              {compatibleBags.length === 0 ? (
                <p className="text-gray-400 text-center py-4" style={{ fontSize: '13px' }}>لا توجد حقائب متاحة من هذه الفصيلة</p>
              ) : compatibleBags.map(bag => {
                const days = Math.ceil((new Date(bag.expiryDate).getTime() - new Date('2025-04-29').getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <label key={bag.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedBags.includes(bag.id) ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200 hover:border-green-200'}`}>
                    <input type="checkbox" checked={selectedBags.includes(bag.id)}
                      onChange={() => setSelectedBags(prev => prev.includes(bag.id) ? prev.filter(x => x !== bag.id) : [...prev, bag.id])}
                      className="w-4 h-4 rounded accent-green-600" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-green-600 bg-green-50 px-2 py-0.5 rounded" style={{ fontSize: '11px', fontWeight: 700 }}>{bag.bagCode}</span>
                      </div>
                      <p className="text-gray-500" style={{ fontSize: '11px' }}>ينتهي: {bag.expiryDate} {days <= 5 && <span className="text-orange-500">(⚠ {days} أيام)</span>}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            <div className="flex gap-3">
              <button onClick={handleFulfill} disabled={selectedBags.length === 0}
                className={`flex-1 py-2.5 text-white rounded-xl transition-all ${selectedBags.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                style={{ fontSize: '14px', fontWeight: 600 }}>
                تأكيد الصرف ({selectedBags.length} حقيبة)
              </button>
              <button onClick={() => { setFulfillModal(null); setSelectedBags([]); }}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all" style={{ fontSize: '14px', fontWeight: 600 }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Add request modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-gray-900 mb-5" style={{ fontSize: '18px', fontWeight: 700 }}>طلب دم جديد</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1.5" style={{ fontSize: '13px', fontWeight: 600 }}>المستشفى</label>
                <select value={newReq.hospitalName} onChange={e => setNewReq(p => ({ ...p, hospitalName: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400" style={{ fontSize: '13px' }}>
                  <option value="">اختر المستشفى</option>
                  {HOSPITALS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1.5" style={{ fontSize: '13px', fontWeight: 600 }}>الفصيلة</label>
                  <select value={newReq.bloodType} onChange={e => setNewReq(p => ({ ...p, bloodType: e.target.value as BloodType }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400" style={{ fontSize: '13px' }}>
                    {BLOOD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1.5" style={{ fontSize: '13px', fontWeight: 600 }}>الكمية</label>
                  <input type="number" min={1} value={newReq.quantity} onChange={e => setNewReq(p => ({ ...p, quantity: parseInt(e.target.value) || 1 }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400" style={{ fontSize: '13px' }} />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-1.5" style={{ fontSize: '13px', fontWeight: 600 }}>الأولوية</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['normal', 'urgent', 'emergency'] as const).map(u => (
                    <button key={u} onClick={() => setNewReq(p => ({ ...p, urgency: u }))}
                      className={`py-2 rounded-xl border-2 transition-all ${newReq.urgency === u ? urgencyColors[u] + ' border-current' : 'border-gray-200 text-gray-500'}`}
                      style={{ fontSize: '12px', fontWeight: 600 }}>{urgencyLabels[u]}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-1.5" style={{ fontSize: '13px', fontWeight: 600 }}>ملاحظات</label>
                <input value={newReq.notes} onChange={e => setNewReq(p => ({ ...p, notes: e.target.value }))} placeholder="اختياري"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400" style={{ fontSize: '13px' }} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleAddRequest} disabled={!newReq.hospitalName}
                className={`flex-1 py-2.5 text-white rounded-xl transition-all ${!newReq.hospitalName ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                style={{ fontSize: '14px', fontWeight: 600 }}>إضافة الطلب</button>
              <button onClick={() => setAddModal(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all" style={{ fontSize: '14px', fontWeight: 600 }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}