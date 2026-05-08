import { TrendingUp, Users } from 'lucide-react';
import { weekData } from './dashboardConstants';

export default function WeeklyChart() {
  return (
    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-50">
        <div>
          <h2 className="text-gray-900" style={{ fontSize: '15px', fontWeight: 700 }}>
            المتبرعون هذا الأسبوع
          </h2>
          <p className="text-gray-400 mt-0.5" style={{ fontSize: '11px' }}>
            إجمالي {weekData.reduce((a, b) => a + b.donors, 0)} متبرع — المعدل اليومي{' '}
            {Math.round(weekData.reduce((a, b) => a + b.donors, 0) / weekData.length)}
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border"
          style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}
        >
          <TrendingUp className="w-3.5 h-3.5" style={{ color: '#16a34a' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#15803d' }}>
            ↑ 12% عن الأسبوع الماضي
          </span>
        </div>
      </div>

      {/* Chart area */}
      <div className="px-6 pt-5 pb-4">
        <div className="relative" style={{ height: '176px' }}>
          {/* Horizontal grid lines + y-axis labels */}
          {[7, 5, 3, 1].map((v) => (
            <div
              key={v}
              className="absolute w-full flex items-center gap-3 pointer-events-none"
              style={{ bottom: `${(v / 7) * 140 + 24}px` }}
            >
              <span
                className="text-gray-300 flex-shrink-0 text-right"
                style={{ fontSize: '9px', fontWeight: 600, width: '14px' }}
              >
                {v}
              </span>
              <div className="flex-1 border-t border-dashed border-gray-100" />
            </div>
          ))}

          {/* Bars */}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 pl-5">
            {weekData.map((d) => {
              const max = Math.max(...weekData.map((w) => w.donors));
              const barHeightPx = Math.max((d.donors / max) * 140, 10);
              const isToday = d.day === 'الثلاثاء';
              return (
                <div key={d.day} className="flex flex-col items-center gap-1.5 flex-1 group">
                  {/* Value label */}
                  <div
                    className={`px-1.5 py-0.5 rounded-md transition-all ${
                      isToday
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-green-50 group-hover:text-green-700'
                    }`}
                    style={{ fontSize: '11px', fontWeight: 700, lineHeight: '1.4' }}
                  >
                    {d.donors}
                  </div>
                  {/* Bar */}
                  <div
                    className="w-full rounded-t-xl transition-all"
                    style={{
                      height: `${barHeightPx}px`,
                      background: isToday
                        ? 'linear-gradient(180deg, #15803d 0%, #22c55e 100%)'
                        : 'linear-gradient(180deg, #86efac 0%, #bbf7d0 100%)',
                      boxShadow: isToday ? '0 4px 12px rgba(34,197,94,0.30)' : undefined,
                    }}
                  />
                  {/* Day name */}
                  <div className="flex flex-col items-center gap-0.5">
                    <span
                      className={isToday ? 'text-green-700' : 'text-gray-400'}
                      style={{ fontSize: '10px', fontWeight: isToday ? 700 : 500 }}
                    >
                      {d.day.slice(0, 3)}
                    </span>
                    {isToday && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend + footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded"
                style={{ background: 'linear-gradient(180deg, #15803d, #22c55e)' }}
              />
              <span className="text-gray-500" style={{ fontSize: '11px' }}>
                اليوم الحالي
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-green-100 border border-green-200" />
              <span className="text-gray-500" style={{ fontSize: '11px' }}>
                أيام الأسبوع
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50">
            <Users className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-500" style={{ fontSize: '11px' }}>
              الأعلى:{' '}
              <span style={{ fontWeight: 700, color: '#374151' }}>
                {Math.max(...weekData.map((w) => w.donors))} متبرع
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
