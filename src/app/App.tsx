import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { router } from "./routes";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import "../styles/fonts.css";

// ── React Query client ─────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data considered fresh for 5 min
      retry: 2, // Retry failed requests twice
      refetchOnWindowFocus: false, // Don't refetch when tab re-focused
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </AuthProvider>
      {/* Dev-only panel — inspect cache, queries, mutations */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
