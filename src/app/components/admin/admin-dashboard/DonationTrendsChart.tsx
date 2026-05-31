import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useChartTheme } from '../../../hooks/useChartTheme';

interface MonthlyStats {
  month: string;
  donations: number;
  newDonors: number;
}

interface DonationTrendsChartProps {
  data: MonthlyStats[];
}

export default function DonationTrendsChart({ data }: DonationTrendsChartProps) {
  const chart = useChartTheme();

  return (
    <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-foreground" style={{ fontSize: '16px', fontWeight: 700 }}>
            اتجاهات التبرع
          </h2>
          <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
            عدد التبرعات والمتبرعين الجدد شهرياً
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chart.primary }} />
            <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
              تبرعات
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chart.secondary }} />
            <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
              متبرعون جدد
            </span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid key="grid" strokeDasharray="3 3" stroke={chart.gridStroke} />
          <XAxis
            key="x-axis"
            dataKey="month"
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
          <Line
            key="line-donations"
            type="monotone"
            dataKey="donations"
            stroke={chart.primary}
            strokeWidth={2.5}
            dot={false}
            name="التبرعات"
          />
          <Line
            key="line-newDonors"
            type="monotone"
            dataKey="newDonors"
            stroke={chart.secondary}
            strokeWidth={2.5}
            dot={false}
            name="متبرعون جدد"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
