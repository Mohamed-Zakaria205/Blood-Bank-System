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
import { useChartTheme } from '../../../hooks/useChartTheme';

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
  const chart = useChartTheme();

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
      <h2 className="text-foreground mb-5" style={{ fontSize: '16px', fontWeight: 700 }}>
        المخزون حسب الفصيلة
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={28}>
          <CartesianGrid key="grid" strokeDasharray="3 3" stroke={chart.gridStroke} />
          <XAxis
            key="x-axis"
            dataKey="type"
            tick={{ fontSize: 11, fill: chart.tickFill, fontFamily: 'Tajawal' }}
          />
          <YAxis key="y-axis" tick={{ fontSize: 11, fill: chart.tickFill }} />
          <Tooltip
            key="tooltip"
            contentStyle={{
              fontFamily: 'Tajawal',
              borderRadius: '12px',
              border: `1px solid ${chart.tooltipBorder}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              fontSize: '13px',
              backgroundColor: chart.tooltipBg,
              color: chart.labelColor,
            }}
          />
          <Bar
            key="bar-available"
            dataKey="available"
            name="متاح"
            fill={chart.primary}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            key="bar-issued"
            dataKey="issued"
            name="صادر"
            fill={chart.quaternary}
            radius={[4, 4, 0, 0]}
          />
          <Legend
            key="legend"
            wrapperStyle={{ fontFamily: 'Tajawal', fontSize: '12px', color: chart.labelColor }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
