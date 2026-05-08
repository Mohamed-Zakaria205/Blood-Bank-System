import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface MonthlyStats {
  month: string;
  donations: number;
  newDonors: number;
}

interface DonationTrendsChartProps {
  data: MonthlyStats[];
}

export default function DonationTrendsChart({ data }: DonationTrendsChartProps) {
  return (
    <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-gray-900" style={{ fontSize: '16px', fontWeight: 700 }}>
            اتجاهات التبرع
          </h2>
          <p className="text-gray-400" style={{ fontSize: '12px' }}>
            عدد التبرعات والمتبرعين الجدد شهرياً
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-600" />
            <span className="text-gray-500" style={{ fontSize: '12px' }}>
              تبرعات
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-400" />
            <span className="text-gray-500" style={{ fontSize: '12px' }}>
              متبرعون جدد
            </span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            key="x-axis"
            dataKey="month"
            tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'Tajawal' }}
          />
          <YAxis key="y-axis" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
          <Tooltip
            key="tooltip"
            contentStyle={{
              fontFamily: 'Tajawal',
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              fontSize: '13px',
            }}
          />
          <Line
            key="line-donations"
            type="monotone"
            dataKey="donations"
            stroke="#16a34a"
            strokeWidth={2.5}
            dot={false}
            name="التبرعات"
          />
          <Line
            key="line-newDonors"
            type="monotone"
            dataKey="newDonors"
            stroke="#60a5fa"
            strokeWidth={2.5}
            dot={false}
            name="متبرعون جدد"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
