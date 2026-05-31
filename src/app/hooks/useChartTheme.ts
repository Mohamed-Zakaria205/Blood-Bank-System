// ═══════════════════════════════════════════════════════════
// useChartTheme — returns a typed palette for Recharts components.
// All chart colors are derived from the current theme, ensuring
// charts adapt correctly in both light and dark mode.
// ═══════════════════════════════════════════════════════════
import { useTheme } from '../contexts/ThemeContext';

export interface ChartTheme {
  /** Stroke color for CartesianGrid lines */
  gridStroke: string;
  /** Fill color for axis tick labels */
  tickFill: string;
  /** Background color for tooltip container */
  tooltipBg: string;
  /** Border color for tooltip container */
  tooltipBorder: string;
  /** Primary line/bar color (green) */
  primary: string;
  /** Secondary line/bar color (blue) */
  secondary: string;
  /** Tertiary line/bar color (orange) */
  tertiary: string;
  /** Quaternary line/bar color (purple) */
  quaternary: string;
  /** Danger/critical color (red) */
  danger: string;
  /** Muted foreground for labels */
  labelColor: string;
}

const lightTheme: ChartTheme = {
  gridStroke: '#f0f0f0',
  tickFill: '#9CA3AF',
  tooltipBg: '#ffffff',
  tooltipBorder: '#e5e7eb',
  primary: '#16a34a',
  secondary: '#60a5fa',
  tertiary: '#f59e0b',
  quaternary: '#a855f7',
  danger: '#ef4444',
  labelColor: '#6b7280',
};

const darkTheme: ChartTheme = {
  gridStroke: 'rgba(168,193,188,0.08)',
  tickFill: '#a8c1bc',
  tooltipBg: '#142824',
  tooltipBorder: 'rgba(168,193,188,0.12)',
  primary: '#4d9e78',
  secondary: '#6baed6',
  tertiary: '#f6a04a',
  quaternary: '#9b7dd4',
  danger: '#c97a74',
  labelColor: '#a8c1bc',
};

/**
 * Returns a typed chart color palette for the current theme.
 * Use inside any component that renders Recharts charts.
 *
 * @example
 * const chart = useChartTheme();
 * <CartesianGrid stroke={chart.gridStroke} />
 * <Line stroke={chart.primary} />
 */
export function useChartTheme(): ChartTheme {
  const { isDark } = useTheme();
  return isDark ? darkTheme : lightTheme;
}
