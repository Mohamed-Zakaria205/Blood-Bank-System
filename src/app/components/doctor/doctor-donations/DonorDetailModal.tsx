import {
  X,
  Building2,
  Smartphone,
  Megaphone,
} from 'lucide-react';
import type { Donation } from '../../../types';
import { donationTypeLabels, genderLabels } from './donorsConstants';

interface DonorDetailModalProps {
  donation: Donation;
  onClose: () => void;
}

export default function DonorDetailModal({ donation, onClose }: DonorDetailModalProps) {
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
              تفاصيل التبرع
            </h3>
            <p className="text-green-600 font-mono" style={{ fontSize: '12px' }}>
              {donation.donationCode}
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
                ['الاسم الكامل', donation.name],
                ['الجنس', genderLabels[donation.gender]],
                ['العمر', `${donation.age} سنة`],
                ['الرقم القومي', donation.nationalId],
                ['الهاتف', donation.phone],
                ['المدينة', donation.district],
                ['العنوان', donation.address],
                ['فصيلة الدم', donation.bloodType],
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
                  {donationTypeLabels[donation.donationType]}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-gray-400" style={{ fontSize: '11px' }}>
                  تاريخ التبرع
                </p>
                <p
                  className="text-gray-900 mt-0.5"
                  style={{ fontSize: '13px', fontWeight: 600 }}
                >
                  {donation.donationDate || '—'}
                </p>
              </div>

              {/* Source */}
              <div
                className={`p-3 rounded-xl ${donation.source === 'campaign' ? 'bg-purple-50' : donation.source === 'app' ? 'bg-blue-50' : 'bg-green-50'}`}
              >
                <p className="text-gray-400" style={{ fontSize: '11px' }}>
                  مصدر التبرع
                </p>
                <p
                  className={`mt-0.5 flex items-center gap-1 ${donation.source === 'campaign' ? 'text-purple-700' : donation.source === 'app' ? 'text-blue-700' : 'text-green-700'}`}
                  style={{ fontSize: '13px', fontWeight: 600 }}
                >
                  {donation.source === 'app' ? (
                    <>
                      <Smartphone className="w-3.5 h-3.5" /> من التطبيق
                    </>
                  ) : donation.source === 'campaign' ? (
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
              {donation.source === 'campaign' && donation.campaignName && (
                <div className="p-3 bg-purple-50 rounded-xl">
                  <p className="text-gray-400" style={{ fontSize: '11px' }}>
                    اسم الحملة
                  </p>
                  <p
                    className="text-purple-700 mt-0.5"
                    style={{ fontSize: '12px', fontWeight: 600 }}
                  >
                    {donation.campaignName}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Data */}
          {donation.additionalData && (
            <div>
              <h4 className="text-gray-700 mb-3" style={{ fontSize: '14px', fontWeight: 700 }}>
                البيانات الطبية التكميلية
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  [
                    'الوزن',
                    donation.additionalData.weight
                      ? `${donation.additionalData.weight} كجم`
                      : '—',
                  ],
                  [
                    'الطول',
                    donation.additionalData.height
                      ? `${donation.additionalData.height} سم`
                      : '—',
                  ],
                  [
                    'الهيموجلوبين',
                    donation.additionalData.hemoglobin
                      ? `${donation.additionalData.hemoglobin} g/dL`
                      : '—',
                  ],
                  ['ضغط الدم', donation.additionalData.bloodPressure || '—'],
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
        </div>
      </div>
    </div>
  );
}
