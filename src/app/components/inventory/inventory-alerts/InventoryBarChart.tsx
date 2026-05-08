import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface InventoryItem {
  type: string;
  available: number;
  issued: number;
  min: number;
}

interface InventoryBarChartProps {
  data: InventoryItem[];
}

export default function InventoryBarChart({ data }: InventoryBarChartProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h2 className="text-gray-900 mb-5" style={{ fontSize: '16px', fontWeight: 700 }}>
        المخزون حسب الفصيلة
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={28}>
          <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            key="x-axis"
            dataKey="type"
            tick={{ fontSize: 11, fill: '#6b7280', fontFamily: 'Tajawal' }}
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
          <Bar
            key="bar-available"
            dataKey="available"
            name="متاح"
            fill="#22c55e"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            key="bar-issued"
            dataKey="issued"
            name="صادر"
            fill="#a78bfa"
            radius={[4, 4, 0, 0]}
          />
          <Legend key="legend" wrapperStyle={{ fontFamily: 'Tajawal', fontSize: '12px' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
