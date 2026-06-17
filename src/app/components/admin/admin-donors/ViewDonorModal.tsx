import { X, User, Phone, MapPin, Activity, Calendar, Award, Smartphone } from 'lucide-react';
import { useDonor } from '../../../hooks/useDonors';
import { statusColors, statusLabels } from './donorsConstants';
import { useModalFocusTrap } from '../../../hooks/useModalFocusTrap';

interface ViewDonorModalProps {
  donorId: string;
  onClose: () => void;
}

export default function ViewDonorModal({ donorId, onClose }: ViewDonorModalProps) {
  const { data: donor, isLoading, isError, refetch } = useDonor(donorId);
  const modalRef = useModalFocusTrap(onClose);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h3
              id="modal-title"
              className="text-foreground"
              style={{ fontSize: '18px', fontWeight: 700 }}
            >
              تفاصيل المتبرع
            </h3>
            {donor && (
              <p className="text-green-600 font-mono mt-0.5" style={{ fontSize: '12px' }}>
                {donor.donorCode}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-muted-foreground hover:bg-muted rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading && (
            <div className="space-y-4 py-8">
              <div className="h-6 bg-muted rounded animate-pulse w-1/3 mx-auto" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-16 bg-muted/40 rounded-xl animate-pulse" />
                <div className="h-16 bg-muted/40 rounded-xl animate-pulse" />
                <div className="h-16 bg-muted/40 rounded-xl animate-pulse" />
                <div className="h-16 bg-muted/40 rounded-xl animate-pulse" />
              </div>
            </div>
          )}

          {isError && (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4" style={{ fontSize: '14px', fontWeight: 600 }}>
                تعذر تحميل بيانات المتبرع التفصيلية
              </p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {!isLoading && !isError && donor && (
            <div className="space-y-6">
              {/* Section 1: Personal Info */}
              <div className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-4">
                <h4
                  className="text-foreground flex items-center gap-2"
                  style={{ fontSize: '15px', fontWeight: 700 }}
                >
                  <User className="w-4 h-4 text-green-600" /> البيانات الشخصية
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-muted/40 p-3.5 rounded-xl">
                    <span className="text-muted-foreground block mb-1" style={{ fontSize: '12px' }}>
                      الاسم الكامل
                    </span>
                    <span
                      className="text-foreground block"
                      style={{ fontSize: '14px', fontWeight: 600 }}
                    >
                      {donor.name}
                    </span>
                  </div>
                  <div className="bg-muted/40 p-3.5 rounded-xl">
                    <span className="text-muted-foreground block mb-1" style={{ fontSize: '12px' }}>
                      الرقم القومي
                    </span>
                    <span className="text-foreground font-mono block" style={{ fontSize: '14px' }}>
                      {donor.nationalId || '—'}
                    </span>
                  </div>
                  <div className="bg-muted/40 p-3.5 rounded-xl">
                    <span className="text-muted-foreground block mb-1" style={{ fontSize: '12px' }}>
                      الجنس
                    </span>
                    <span className="text-foreground block" style={{ fontSize: '14px' }}>
                      {donor.gender === 'male' ? 'ذكر' : donor.gender === 'female' ? 'أنثى' : '—'}
                    </span>
                  </div>
                  <div className="bg-muted/40 p-3.5 rounded-xl">
                    <span className="text-muted-foreground block mb-1" style={{ fontSize: '12px' }}>
                      تاريخ الميلاد / السن
                    </span>
                    <span className="text-foreground block" style={{ fontSize: '14px' }}>
                      {donor.dateOfBirth
                        ? `${donor.dateOfBirth} (${donor.age} سنة)`
                        : `${donor.age} سنة`}
                    </span>
                  </div>
                  <div className="bg-muted/40 p-3.5 rounded-xl sm:col-span-2">
                    <span
                      className="text-muted-foreground block mb-1 flex items-center gap-1.5"
                      style={{ fontSize: '12px' }}
                    >
                      <Phone className="w-3.5 h-3.5" /> رقم الهاتف
                    </span>
                    <span
                      className="text-foreground font-mono block text-right"
                      style={{ fontSize: '14px' }}
                      dir="ltr"
                    >
                      {donor.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Address */}
              <div className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-4">
                <h4
                  className="text-foreground flex items-center gap-2"
                  style={{ fontSize: '15px', fontWeight: 700 }}
                >
                  <MapPin className="w-4 h-4 text-green-600" /> العنوان والمنطقة
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-muted/40 p-3.5 rounded-xl">
                    <span className="text-muted-foreground block mb-1" style={{ fontSize: '12px' }}>
                      المحافظة
                    </span>
                    <span
                      className="text-foreground block"
                      style={{ fontSize: '14px', fontWeight: 600 }}
                    >
                      {donor.governorate || '—'}
                    </span>
                  </div>
                  <div className="bg-muted/40 p-3.5 rounded-xl">
                    <span className="text-muted-foreground block mb-1" style={{ fontSize: '12px' }}>
                      المركز/المدينة
                    </span>
                    <span
                      className="text-foreground block"
                      style={{ fontSize: '14px', fontWeight: 600 }}
                    >
                      {donor.district || '—'}
                    </span>
                  </div>
                  <div className="bg-muted/40 p-3.5 rounded-xl">
                    <span className="text-muted-foreground block mb-1" style={{ fontSize: '12px' }}>
                      المنطقة/الشارع
                    </span>
                    <span
                      className="text-foreground block"
                      style={{ fontSize: '14px', fontWeight: 600 }}
                    >
                      {donor.area || '—'}
                    </span>
                  </div>
                  {donor.address && (
                    <div className="bg-muted/40 p-3.5 rounded-xl sm:col-span-3">
                      <span
                        className="text-muted-foreground block mb-1"
                        style={{ fontSize: '12px' }}
                      >
                        العنوان الكامل المسجل
                      </span>
                      <span className="text-foreground block" style={{ fontSize: '14px' }}>
                        {donor.address}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: Donation & Health Info */}
              <div className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-4">
                <h4
                  className="text-foreground flex items-center gap-2"
                  style={{ fontSize: '15px', fontWeight: 700 }}
                >
                  <Activity className="w-4 h-4 text-green-600" /> السجل وحالة التبرع
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-muted/40 p-3.5 rounded-xl flex items-center justify-between">
                    <span className="text-muted-foreground" style={{ fontSize: '13px' }}>
                      فصيلة الدم
                    </span>
                    <span
                      className="px-3 py-1 bg-red-50 border border-red-100 text-red-700 rounded-lg font-bold"
                      style={{ fontSize: '14px' }}
                    >
                      {donor.bloodType || '—'}
                    </span>
                  </div>
                  <div className="bg-muted/40 p-3.5 rounded-xl flex items-center justify-between">
                    <span className="text-muted-foreground" style={{ fontSize: '13px' }}>
                      حالة الأهلية
                    </span>
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-bold ${statusColors[donor.status]}`}
                    >
                      {statusLabels[donor.status] || donor.status}
                    </span>
                  </div>
                  <div className="bg-muted/40 p-3.5 rounded-xl">
                    <span
                      className="text-muted-foreground flex items-center gap-1.5 mb-1"
                      style={{ fontSize: '12px' }}
                    >
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> آخر تبرع
                    </span>
                    <span
                      className="text-foreground font-mono block"
                      style={{ fontSize: '14px', fontWeight: 600 }}
                    >
                      {donor.lastDonationDate || '—'}
                    </span>
                  </div>
                  <div className="bg-muted/40 p-3.5 rounded-xl">
                    <span className="text-muted-foreground block mb-1" style={{ fontSize: '12px' }}>
                      عدد التبرعات
                    </span>
                    <span
                      className="text-foreground block"
                      style={{ fontSize: '14px', fontWeight: 600 }}
                    >
                      {donor.donations !== undefined ? donor.donations : 0}
                    </span>
                  </div>
                  <div className="bg-muted/40 p-3.5 rounded-xl flex items-center justify-between">
                    <span
                      className="text-muted-foreground flex items-center gap-1.5"
                      style={{ fontSize: '13px' }}
                    >
                      <Award className="w-4 h-4 text-muted-foreground" /> النقاط المكتسبة
                    </span>
                    <span
                      className="text-amber-600 font-mono font-bold"
                      style={{ fontSize: '15px' }}
                    >
                      {donor.points || 0}
                    </span>
                  </div>
                  <div className="bg-muted/40 p-3.5 rounded-xl flex items-center justify-between">
                    <span
                      className="text-muted-foreground flex items-center gap-1.5"
                      style={{ fontSize: '13px' }}
                    >
                      <Smartphone className="w-4 h-4 text-muted-foreground" /> الحساب على التطبيق
                    </span>
                    <span
                      className={`font-semibold ${donor.hasAppAccount ? 'text-green-600' : 'text-muted-foreground'}`}
                      style={{ fontSize: '13px' }}
                    >
                      {donor.hasAppAccount ? 'نشط' : 'غير متصل'}
                    </span>
                  </div>
                </div>

                {donor.status !== 'eligible' && (donor.rejectionReason || donor.deferredUntil) && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4 mt-4">
                    <h5
                      className="text-red-700 font-bold mb-2 flex items-center gap-1.5"
                      style={{ fontSize: '13px' }}
                    >
                      <Activity className="w-4 h-4" /> سبب الاستبعاد / التأجيل:
                    </h5>
                    <ul
                      className="list-disc list-inside text-red-600 space-y-1"
                      style={{ fontSize: '13px' }}
                    >
                      {donor.rejectionReason && <li>{donor.rejectionReason}</li>}
                      {donor.deferredUntil && (
                        <li>
                          مؤجل حتى:{' '}
                          <span className="font-mono bg-card px-2 py-0.5 rounded text-red-700">
                            {donor.deferredUntil}
                          </span>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-border bg-muted/40 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-muted hover:bg-gray-300 text-foreground rounded-xl transition-all font-semibold"
            style={{ fontSize: '13px' }}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
