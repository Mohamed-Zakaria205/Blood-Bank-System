import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface TrendData {
  month: string;
  issued?: number;
  wasted?: number;
}

interface IssuanceTrendChartProps {
  data: TrendData[];
}

export default function IssuanceTrendChart({ data }: IssuanceTrendChartProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h2 className="text-gray-900 mb-5" style={{ fontSize: '16px', fontWeight: 700 }}>
        اتجاهات الصرف والهدر
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            key="x-axis"
            dataKey="month"
            tick={{ fontSize: 10, fill: '#9CA3AF', fontFamily: 'Tajawal' }}
          />
          <YAxis key="y-axis" tick={{ fontSize: 11, fill: '#9ca3af' }} />
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
            key="line-issued"
            type="monotone"
            dataKey="issued"
            stroke="#22c55e"
            strokeWidth={2.5}
            dot={false}
            name="مُصرف"
          />
          <Line
            key="line-wasted"
            type="monotone"
            dataKey="wasted"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            name="هدر"
            strokeDasharray="5 5"
          />
          <Legend key="legend" wrapperStyle={{ fontFamily: 'Tajawal', fontSize: '12px' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
