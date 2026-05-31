import { RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import { router } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { handleApiError } from './api/errors';

import '../styles/fonts.css';

// ── Extract a human-readable message from any thrown value ──
function getErrorMessage(error: unknown): string {
  const normalized = handleApiError(error);
  return normalized.message || 'حدث خطأ غير متوقع، يرجى المحاولة مجدداً';
}

// ── React Query client ─────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data considered fresh for 5 min
      retry: 2,                  // Retry failed requests twice
      refetchOnWindowFocus: false,
    },
    mutations: {
      // ── Global mutation error handler ──────────────────────
      // Fires for every mutation that doesn't define its own onError.
      // Prevents errors from being silently swallowed.
      onError: (error: unknown) => {
        toast.error(getErrorMessage(error));
      },
    },
  },
});

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster theme="system" />
        </AuthProvider>
        {/* Dev-only panel — inspect cache, queries, mutations */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
