// ═══════════════════════════════════════════════════════════
// Shared loading skeleton for Phase 3 component migration
// ═══════════════════════════════════════════════════════════

/** Full-page shimmer loader */
export function PageLoader({ message = 'جاري التحميل...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 rounded-full border-4 border-green-100 border-t-green-600 animate-spin" />
      </div>
      <p className="text-gray-500" style={{ fontSize: '14px', fontWeight: 600 }}>
        {message}
      </p>
    </div>
  );
}

/** Error state with retry */
export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
        <span className="text-3xl">⚠️</span>
      </div>
      <p className="text-gray-700" style={{ fontSize: '16px', fontWeight: 700 }}>
        حدث خطأ
      </p>
      <p className="text-gray-500" style={{ fontSize: '14px' }}>
        {message || 'تعذر تحميل البيانات'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
          style={{ fontSize: '14px', fontWeight: 600 }}
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}

/** Card shimmer placeholder */
export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse"
        >
          <div className="w-11 h-11 bg-gray-200 rounded-xl mb-4" />
          <div className="h-8 w-16 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-24 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}

/** Table shimmer placeholder */
export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="p-5 border-b border-gray-100">
        <div className="h-5 w-32 bg-gray-200 rounded" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-4 py-3 text-right">
                  <div className="h-3 w-16 bg-gray-200 rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="border-b border-gray-50">
                {Array.from({ length: cols }).map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <div
                      className={`h-4 bg-gray-100 rounded`}
                      style={{ width: `${60 + Math.random() * 40}%` }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
