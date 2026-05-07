// ═══════════════════════════════════════════════════════════
// Shared Empty State for tables
// ═══════════════════════════════════════════════════════════
import { Inbox } from 'lucide-react';

export function EmptyState({
  message = 'لا توجد بيانات',
  colSpan = 10,
}: {
  message?: string;
  colSpan?: number;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-16 text-center border-b border-gray-50">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
            <Inbox className="w-8 h-8" />
          </div>
          <p className="text-gray-500" style={{ fontSize: '15px', fontWeight: 500 }}>
            {message}
          </p>
        </div>
      </td>
    </tr>
  );
}
