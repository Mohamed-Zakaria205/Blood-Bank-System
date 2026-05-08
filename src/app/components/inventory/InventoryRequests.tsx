import { useState } from 'react';
import { Building2, CheckCircle, Package, AlertTriangle, Search, Plus } from 'lucide-react';
import type { BloodBag, BloodType, RequestUrgency } from '../../types';
import {
  useBloodBags,
  useHospitalRequests,
  useAddHospitalRequest,
  useFulfillRequest,
} from '../../hooks/useInventory';
import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';

// ── Sub-components & constants ──
import {
  urgencyColors,
  urgencyLabels,
  statusColors,
  statusLabels,
} from './inventory-requests/requestsConstants';
import FulfillRequestModal from './inventory-requests/FulfillRequestModal';
import AddRequestModal from './inventory-requests/AddRequestModal';

export default function InventoryRequests() {
  const { data: bags = [], isLoading: isLoadingBags, isError: isErrorBags } = useBloodBags();
  const {
    data: requests = [],
    isLoading: isLoadingRequests,
    isError: isErrorRequests,
  } = useHospitalRequests();
  const addRequestMutation = useAddHospitalRequest();
  const fulfillRequestMutation = useFulfillRequest();

  const [fulfillModal, setFulfillModal] = useState<string | null>(null);
  const [selectedBags, setSelectedBags] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'fulfilled'>(
    'all',
  );
  const [search, setSearch] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [newReq, setNewReq] = useState({
    hospitalName: '',
    bloodType: 'O+' as BloodType,
    quantity: 1,
    urgency: 'normal' as RequestUrgency,
    notes: '',
  });

  if (isLoadingBags || isLoadingRequests)
    return (
      <div className="space-y-6 p-2">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <CardSkeleton count={3} />
        <TableSkeleton rows={5} cols={6} />
      </div>
    );
  if (isErrorBags || isErrorRequests)
    return (
      <ErrorState
        message="فشل في تحميل الطلبات، يرجى المحاولة لاحقاً"
        onRetry={() => window.location.reload()}
      />
    );

  const filtered = requests.filter((r) => {
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchSearch = r.hospitalName.includes(search) || r.bloodType.includes(search);
    return matchStatus && matchSearch;
  });

  const getCompatibleBags = (bloodType: BloodType): BloodBag[] =>
    bags.filter((b) => b.bloodType === bloodType && b.status === 'available');

  const currentReq = requests.find((r) => r.id === fulfillModal);
  const compatibleBags = currentReq ? getCompatibleBags(currentReq.bloodType) : [];

  const handleFulfill = async () => {
    if (!fulfillModal || selectedBags.length === 0) return;
    try {
      await fulfillRequestMutation.mutateAsync({
        requestId: fulfillModal,
        bagIds: selectedBags,
      });
      setFulfillModal(null);
      setSelectedBags([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddRequest = async () => {
    try {
      await addRequestMutation.mutateAsync({
        ...newReq,
        requestedAt: new Date().toLocaleString('ar-EG'),
        status: 'pending',
      });
      setAddModal(false);
      setNewReq({
        hospitalName: '',
        bloodType: 'O+',
        quantity: 1,
        urgency: 'normal',
        notes: '',
      });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleBag = (bagId: string) => {
    setSelectedBags((prev) =>
      prev.includes(bagId) ? prev.filter((x) => x !== bagId) : [...prev, bagId],
    );
  };

  const pending = requests.filter((r) => r.status === 'pending').length;
  const approved = requests.filter((r) => r.status === 'approved').length;
  const fulfilled = requests.filter((r) => r.status === 'fulfilled').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: '22px', fontWeight: 800 }}>
            طلبات المستشفيات
          </h1>
          <p className="text-gray-500" style={{ fontSize: '14px' }}>
            {approved} طلب معتمد جاهز للصرف
          </p>
        </div>
        <button
          onClick={() => setAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl transition-all"
          style={{
            background: 'linear-gradient(135deg, #15803d, #16a34a)',
            fontSize: '14px',
            fontWeight: 700,
          }}
        >
          <Plus className="w-4 h-4" /> طلب جديد
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'قيد المراجعة',
            value: pending,
            color: 'text-yellow-700',
            bg: 'bg-yellow-50 border-yellow-200',
          },
          {
            label: 'معتمد - جاهز',
            value: approved,
            color: 'text-blue-700',
            bg: 'bg-blue-50 border-blue-200',
          },
          {
            label: 'تم الصرف',
            value: fulfilled,
            color: 'text-green-700',
            bg: 'bg-green-50 border-green-200',
          },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} border rounded-2xl p-4`}>
            <div className={s.color} style={{ fontSize: '26px', fontWeight: 800 }}>
              {s.value}
            </div>
            <div className={`${s.color} opacity-80`} style={{ fontSize: '13px', fontWeight: 600 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالمستشفى أو الفصيلة..."
            className="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400"
            style={{ fontSize: '13px' }}
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'fulfilled'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl transition-all ${filterStatus === s ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              {s === 'all' ? 'الكل' : statusLabels[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Requests list */}
      <div className="space-y-3">
        {filtered.map((req) => {
          const compat = getCompatibleBags(req.bloodType);
          const canFulfill = req.status === 'approved';
          const hasStock = compat.length >= req.quantity;
          return (
            <div
              key={req.id}
              className={`bg-white rounded-2xl p-5 border shadow-sm ${req.urgency === 'emergency' ? 'border-red-200' : req.urgency === 'urgent' ? 'border-orange-200' : 'border-gray-100'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${req.urgency === 'emergency' ? 'bg-red-50' : req.urgency === 'urgent' ? 'bg-orange-50' : 'bg-blue-50'}`}
                  >
                    <Building2
                      className={`w-6 h-6 ${req.urgency === 'emergency' ? 'text-red-600' : req.urgency === 'urgent' ? 'text-orange-600' : 'text-blue-600'}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-gray-900" style={{ fontSize: '15px', fontWeight: 700 }}>
                        {req.hospitalName}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full ${urgencyColors[req.urgency]}`}
                        style={{ fontSize: '11px', fontWeight: 700 }}
                      >
                        {urgencyLabels[req.urgency]}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full ${statusColors[req.status]}`}
                        style={{ fontSize: '11px', fontWeight: 700 }}
                      >
                        {statusLabels[req.status]}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-1" style={{ fontSize: '13px' }}>
                      فصيلة{' '}
                      <span className="text-red-600" style={{ fontWeight: 800 }}>
                        {req.bloodType}
                      </span>{' '}
                      — {req.quantity} وحدة
                      <span className="mx-2 text-gray-300">|</span>
                      متاح في المخزون:{' '}
                      <span
                        className={`${hasStock ? 'text-green-600' : 'text-red-600'}`}
                        style={{ fontWeight: 700 }}
                      >
                        {compat.length} حقيبة
                      </span>
                    </p>
                    {req.notes && (
                      <p className="text-gray-400" style={{ fontSize: '12px' }}>
                        {req.notes}
                      </p>
                    )}
                    <p className="text-gray-400 mt-1" style={{ fontSize: '11px' }}>
                      #{req.id} • {req.requestedAt}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {canFulfill &&
                    (hasStock ? (
                      <button
                        onClick={() => {
                          setFulfillModal(req.id);
                          setSelectedBags([]);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
                        style={{ fontSize: '13px', fontWeight: 700 }}
                      >
                        <Package className="w-4 h-4" /> صرف الطلب
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-100 rounded-xl">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span
                          className="text-red-600"
                          style={{ fontSize: '12px', fontWeight: 600 }}
                        >
                          مخزون غير كافٍ
                        </span>
                      </div>
                    ))}
                  {req.status === 'fulfilled' && (
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-green-50 rounded-xl">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span
                        className="text-green-700"
                        style={{ fontSize: '12px', fontWeight: 600 }}
                      >
                        تم الصرف
                      </span>
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
            <p className="text-gray-400" style={{ fontSize: '14px' }}>
              لا توجد طلبات
            </p>
          </div>
        )}
      </div>

      {/* Fulfill modal */}
      {fulfillModal && currentReq && (
        <FulfillRequestModal
          request={currentReq}
          compatibleBags={compatibleBags}
          selectedBags={selectedBags}
          onToggleBag={toggleBag}
          onFulfill={handleFulfill}
          onCancel={() => {
            setFulfillModal(null);
            setSelectedBags([]);
          }}
          isPending={fulfillRequestMutation.isPending}
        />
      )}

      {/* Add request modal */}
      {addModal && (
        <AddRequestModal
          form={newReq}
          onChange={setNewReq}
          onSubmit={handleAddRequest}
          onCancel={() => setAddModal(false)}
        />
      )}
    </div>
  );
}
