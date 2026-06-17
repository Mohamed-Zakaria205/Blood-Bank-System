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
import { useChartTheme } from '../../../hooks/useChartTheme';

interface TrendData {
  month: string;
  issued?: number;
  wasted?: number;
}

interface IssuanceTrendChartProps {
  data: TrendData[];
}

export default function IssuanceTrendChart({ data }: IssuanceTrendChartProps) {
  const chart = useChartTheme();

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
      <h2 className="text-foreground mb-5" style={{ fontSize: '16px', fontWeight: 700 }}>
        اتجاهات الصرف والهدر
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid key="grid" strokeDasharray="3 3" stroke={chart.gridStroke} />
          <XAxis
            key="x-axis"
            dataKey="month"
            tick={{ fontSize: 10, fill: chart.tickFill, fontFamily: 'Tajawal' }}
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
          <Line
            key="line-issued"
            type="monotone"
            dataKey="issued"
            stroke={chart.primary}
            strokeWidth={2.5}
            dot={false}
            name="مُصرف"
          />
          <Line
            key="line-wasted"
            type="monotone"
            dataKey="wasted"
            stroke={chart.danger}
            strokeWidth={2}
            dot={false}
            name="هدر"
            strokeDasharray="5 5"
          />
          <Legend
            key="legend"
            wrapperStyle={{ fontFamily: 'Tajawal', fontSize: '12px', color: chart.labelColor }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
