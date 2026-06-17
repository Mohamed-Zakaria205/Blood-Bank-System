// ═══════════════════════════════════════════════════════════
// ThemeToggle — Sun/Moon button for switching light/dark mode
// Lives in the DashboardLayout header between notifications
// and the user info panel.
// ═══════════════════════════════════════════════════════════
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-xl text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      title={isDark ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
      aria-label={isDark ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
      aria-pressed={isDark}
    >
      {/* Sun icon — shown in dark mode to switch to light */}
      <Sun
        className={`w-[18px] h-[18px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
          isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
        }`}
      />
      {/* Moon icon — shown in light mode to switch to dark */}
      <Moon
        className={`w-[18px] h-[18px] transition-all duration-300 ${
          isDark ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
        }`}
      />
    </button>
  );
}
