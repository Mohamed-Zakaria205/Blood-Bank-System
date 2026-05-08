import {
  X,
  Building2,
  Smartphone,
  Megaphone,
  Clock,
} from 'lucide-react';
import type { Donor } from '../../../types';
import { statusColors, statusLabels, donationTypeLabels, genderLabels } from './donorsConstants';

interface DonorDetailModalProps {
  donor: Donor;
  onClose: () => void;
}

export default function DonorDetailModal({ donor, onClose }: DonorDetailModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <h3 className="text-gray-900" style={{ fontSize: '18px', fontWeight: 700 }}>
              تفاصيل المتبرع
            </h3>
            <p className="text-green-600 font-mono" style={{ fontSize: '12px' }}>
              {donor.donorCode}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Personal Info */}
          <div>
            <h4 className="text-gray-700 mb-3" style={{ fontSize: '14px', fontWeight: 700 }}>
              البيانات الشخصية
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['الاسم الكامل', donor.name],
                ['الجنس', genderLabels[donor.gender]],
                ['العمر', `${donor.age} سنة`],
                ['الرقم القومي', donor.nationalId],
                ['الهاتف', donor.phone],
                ['المدينة', donor.city],
                ['العنوان', donor.address],
                ['فصيلة الدم', donor.bloodType],
              ].map(([label, val]) => (
                <div key={label} className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-gray-400" style={{ fontSize: '11px' }}>
                    {label}
                  </p>
                  <p
                    className="text-gray-900 mt-0.5"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    {val}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Sample code */}
          {donor.status === 'eligible' ? (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-xl">
              <span className="text-gray-500" style={{ fontSize: '12px' }}>
                رمز العينة
              </span>
              <span
                className="font-mono text-green-700 bg-green-100 px-3 py-1 rounded-lg"
                style={{ fontSize: '13px', fontWeight: 700 }}
              >
                {donor.donorCode}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
              <span className="text-gray-500" style={{ fontSize: '12px' }}>
                رمز العينة
              </span>
              <span
                className="text-gray-400 flex items-center gap-1.5"
                style={{ fontSize: '12px' }}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
                غير مفعّل ({donor.status === 'deferred' ? 'موجل' : 'غير مؤهل'})
              </span>
            </div>
          )}

          {/* Donation Details */}
          <div>
            <h4 className="text-gray-700 mb-3" style={{ fontSize: '14px', fontWeight: 700 }}>
              بيانات التبرع
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-gray-400" style={{ fontSize: '11px' }}>
                  نوع التبرع
                </p>
                <p
                  className="text-gray-900 mt-0.5"
                  style={{ fontSize: '13px', fontWeight: 600 }}
                >
                  {donationTypeLabels[donor.donationType]}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-gray-400" style={{ fontSize: '11px' }}>
                  آخر تبرع
                </p>
                <p
                  className="text-gray-900 mt-0.5"
                  style={{ fontSize: '13px', fontWeight: 600 }}
                >
                  {donor.lastDonationDate || '—'}
                </p>
              </div>

              {/* Source */}
              <div
                className={`p-3 rounded-xl ${donor.source === 'campaign' ? 'bg-purple-50' : donor.source === 'app' ? 'bg-blue-50' : 'bg-green-50'}`}
              >
                <p className="text-gray-400" style={{ fontSize: '11px' }}>
                  مصدر التبرع
                </p>
                <p
                  className={`mt-0.5 flex items-center gap-1 ${donor.source === 'campaign' ? 'text-purple-700' : donor.source === 'app' ? 'text-blue-700' : 'text-green-700'}`}
                  style={{ fontSize: '13px', fontWeight: 600 }}
                >
                  {donor.source === 'app' ? (
                    <>
                      <Smartphone className="w-3.5 h-3.5" /> من التطبيق
                    </>
                  ) : donor.source === 'campaign' ? (
                    <>
                      <Megaphone className="w-3.5 h-3.5" /> من حملة
                    </>
                  ) : (
                    <>
                      <Building2 className="w-3.5 h-3.5" /> داخل البنك
                    </>
                  )}
                </p>
              </div>

              {/* Campaign name */}
              {donor.source === 'campaign' && donor.campaignName && (
                <div className="p-3 bg-purple-50 rounded-xl">
                  <p className="text-gray-400" style={{ fontSize: '11px' }}>
                    اسم الحملة
                  </p>
                  <p
                    className="text-purple-700 mt-0.5"
                    style={{ fontSize: '12px', fontWeight: 600 }}
                  >
                    {donor.campaignName}
                  </p>
                </div>
              )}

              {/* Deferred until */}
              {donor.status === 'deferred' && donor.deferredUntil && (
                <div className="p-3 bg-orange-50 rounded-xl col-span-2">
                  <p className="text-gray-400" style={{ fontSize: '11px' }}>
                    موجل حتى
                  </p>
                  <p
                    className="text-orange-700 mt-0.5 flex items-center gap-1"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    <Clock className="w-3.5 h-3.5" /> {donor.deferredUntil}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Data */}
          {donor.additionalData && (
            <div>
              <h4 className="text-gray-700 mb-3" style={{ fontSize: '14px', fontWeight: 700 }}>
                البيانات الطبية التكميلية
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  [
                    'الوزن',
                    donor.additionalData.weight
                      ? `${donor.additionalData.weight} كجم`
                      : '—',
                  ],
                  [
                    'الطول',
                    donor.additionalData.height
                      ? `${donor.additionalData.height} سم`
                      : '—',
                  ],
                  [
                    'الهيموجلوبين',
                    donor.additionalData.hemoglobin
                      ? `${donor.additionalData.hemoglobin} g/dL`
                      : '—',
                  ],
                  ['ضغط الدم', donor.additionalData.bloodPressure || '—'],
                ].map(([label, val]) => (
                  <div key={label} className="p-3 bg-blue-50 rounded-xl text-center">
                    <p className="text-blue-400" style={{ fontSize: '11px' }}>
                      {label}
                    </p>
                    <p
                      className="text-blue-900 mt-0.5"
                      style={{ fontSize: '14px', fontWeight: 700 }}
                    >
                      {val}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center justify-between p-4 rounded-xl border-2 border-dashed border-gray-200">
            <span className="text-gray-600" style={{ fontSize: '14px', fontWeight: 600 }}>
              حالة التأهل
            </span>
            <span
              className={`px-3 py-1.5 rounded-full ${statusColors[donor.status]}`}
              style={{ fontSize: '14px', fontWeight: 700 }}
            >
              {statusLabels[donor.status]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
