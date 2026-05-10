import { Clock } from 'lucide-react';
import { EmptyState } from '../../shared/EmptyState';
import type { BloodBag } from '../../../types';

const TODAY = new Date();

function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));
}

interface NearExpiryTableProps {
  bags: BloodBag[];
}

export default function NearExpiryTable({ bags }: NearExpiryTableProps) {
  const nearExpiry = bags
    .filter((b) => {
      if (b.status !== 'available') return false;
      const d = daysUntil(b.expiryDate);
      return d >= 0 && d <= 5;
    })
    .sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate));

  return (
    <div className="bg-white rounded-2xl border border-orange-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-orange-100 flex items-center gap-2">
        <Clock className="w-5 h-5 text-orange-500" />
        <h2 className="text-gray-900" style={{ fontSize: '16px', fontWeight: 700 }}>
          حقائب قريبة الانتهاء (خلال 5 أيام)
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-orange-50">
              {['كود الحقيبة', 'الفصيلة', 'تاريخ الانتهاء', 'الأيام المتبقية'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-right text-orange-700"
                  style={{ fontSize: '12px', fontWeight: 600 }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-orange-50">
            {nearExpiry.map((bag) => {
              const d = daysUntil(bag.expiryDate);
              return (
                <tr key={bag.id} className="hover:bg-orange-50">
                  <td className="px-4 py-3">
                    <span
                      className="font-mono text-green-600 bg-green-50 px-2 py-0.5 rounded"
                      style={{ fontSize: '11px', fontWeight: 700 }}
                    >
                      {bag.bagCode}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 bg-red-50 text-red-600 rounded"
                      style={{ fontSize: '12px', fontWeight: 800 }}
                    >
                      {bag.bloodType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600" style={{ fontSize: '12px' }}>
                    {bag.expiryDate}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full ${d <= 1 ? 'bg-red-100 text-red-700' : d <= 3 ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}
                      style={{ fontSize: '12px', fontWeight: 700 }}
                    >
                      {d} يوم
                    </span>
                  </td>
                </tr>
              );
            })}
            {nearExpiry.length === 0 && (
              <EmptyState colSpan={4} message="لا توجد حقائب قريبة الانتهاء" />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
