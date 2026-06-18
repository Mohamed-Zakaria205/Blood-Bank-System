import { Clock } from 'lucide-react';
import { EmptyState } from '../../shared/EmptyState';
import type { ExpiringSoonBagItem } from '../../../types';

interface NearExpiryTableProps {
  bags: ExpiringSoonBagItem[];
}

export default function NearExpiryTable({ bags }: NearExpiryTableProps) {
  return (
    <div className="bg-card rounded-2xl border border-orange-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-orange-100 flex items-center gap-2">
        <Clock className="w-5 h-5 text-orange-500" />
        <h2 className="text-foreground" style={{ fontSize: '16px', fontWeight: 700 }}>
          حقائب قريبة الانتهاء
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
            {bags.map((bag) => {
              const d = bag.daysRemaining;
              return (
                <tr key={bag.bagId} className="hover:bg-orange-50">
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
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: '12px' }}>
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
            {bags.length === 0 && (
              <EmptyState colSpan={4} message="لا توجد حقائب قريبة الانتهاء" />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
