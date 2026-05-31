// ═══════════════════════════════════════════════════════════
// ThemeContext — typed wrapper around next-themes
// Provides a centralized, strictly-typed theming API.
// ═══════════════════════════════════════════════════════════
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import type { ReactNode } from 'react';

// ── Types ──────────────────────────────────────────────────
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  /** The currently resolved theme ('light' or 'dark'). Never undefined. */
  resolvedTheme: 'light' | 'dark';
  /** The user-selected theme (may be 'system'). Never undefined. */
  theme: Theme;
  /** Toggle between light and dark. */
  toggleTheme: () => void;
  /** Explicitly set a theme. */
  setTheme: (theme: Theme) => void;
  /** True when the dark theme is active. */
  isDark: boolean;
}

// ── Hook ───────────────────────────────────────────────────
/**
 * Returns the current theme state.
 * Must be used inside <ThemeProvider>.
 */
export function useTheme(): ThemeContextValue {
  const { theme, resolvedTheme, setTheme } = useNextTheme();

  const resolved: 'light' | 'dark' =
    resolvedTheme === 'dark' ? 'dark' : 'light';

  const currentTheme: Theme =
    theme === 'dark' ? 'dark' : theme === 'system' ? 'system' : 'light';

  const toggleTheme = () => {
    setTheme(resolved === 'dark' ? 'light' : 'dark');
  };

  return {
    resolvedTheme: resolved,
    theme: currentTheme,
    toggleTheme,
    setTheme: (t: Theme) => setTheme(t),
    isDark: resolved === 'dark',
  };
}

// ── Provider ───────────────────────────────────────────────
interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="bloodlink-theme"
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
