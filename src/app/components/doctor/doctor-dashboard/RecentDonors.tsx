import { ArrowUpRight, Building2, Smartphone } from 'lucide-react';
import type { Donor } from '../../../types/donor';

interface RecentDonorsProps {
  donors: Donor[];
  onViewAll: () => void;
}

export default function RecentDonors({ donors, onViewAll }: RecentDonorsProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-gray-900" style={{ fontSize: '16px', fontWeight: 700 }}>
          آخر المتبرعين
        </h2>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-green-600 hover:underline"
          style={{ fontSize: '12px' }}
        >
          عرض الكل <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {donors.slice(0, 6).map((d) => (
          <div
            key={d.id}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-red-600" style={{ fontSize: '11px', fontWeight: 800 }}>
                {d.bloodType}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 truncate" style={{ fontSize: '13px', fontWeight: 600 }}>
                {d.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {d.source === 'app' ? (
                  <span
                    className="flex items-center gap-0.5 text-blue-600"
                    style={{ fontSize: '10px' }}
                  >
                    <Smartphone className="w-2.5 h-2.5" /> تطبيق
                  </span>
                ) : (
                  <span
                    className="flex items-center gap-0.5 text-green-600"
                    style={{ fontSize: '10px' }}
                  >
                    <Building2 className="w-2.5 h-2.5" /> البنك
                  </span>
                )}
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full flex-shrink-0 ${d.status === 'eligible' ? 'bg-green-100 text-green-700' : d.status === 'deferred' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}
              style={{ fontSize: '10px', fontWeight: 700 }}
            >
              {d.status === 'eligible' ? 'مؤهل' : d.status === 'deferred' ? 'موجل' : 'غير مؤهل'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
