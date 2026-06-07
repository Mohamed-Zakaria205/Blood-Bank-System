import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { useEffect } from 'react';

export default function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  useEffect(() => {
    if (error instanceof Error) {
      const isChunkError =
        error.message.includes('Failed to fetch dynamically imported module') ||
        error.message.includes('error loading dynamically imported module') ||
        error.message.includes('ChunkLoadError');

      if (isChunkError) {
        const hasReloaded = sessionStorage.getItem('chunk_retry_failed');
        if (!hasReloaded) {
          sessionStorage.setItem('chunk_retry_failed', 'true');
          window.location.reload();
        }
      }
    }
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background p-4"
      dir="rtl"
      style={{ fontFamily: "'Tajawal', sans-serif" }}
    >
      <div className="bg-card p-8 rounded-3xl shadow-sm border border-border max-w-lg w-full text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>

        <h1 className="text-foreground mb-3" style={{ fontSize: '24px', fontWeight: 800 }}>
          {isRouteErrorResponse(error)
            ? `خطأ ${error.status}: ${error.statusText}`
            : 'عذراً، حدث خطأ غير متوقع'}
        </h1>

        <p className="text-muted-foreground mb-8" style={{ fontSize: '15px', lineHeight: 1.6 }}>
          {isRouteErrorResponse(error)
            ? 'الصفحة التي تحاول الوصول إليها غير موجودة أو حدث خطأ في الخادم.'
            : import.meta.env.DEV && error instanceof Error
              ? error.message
              : 'نواجه مشكلة فنية حالياً. يرجى تحديث الصفحة أو العودة للرئيسية.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
            style={{ fontSize: '15px', fontWeight: 700 }}
          >
            <RefreshCcw className="w-4 h-4" />
            تحديث الصفحة
          </button>
          <button
            onClick={() => navigate('/', { replace: true })}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-muted text-foreground rounded-xl hover:bg-accent transition-colors"
            style={{ fontSize: '15px', fontWeight: 700 }}
          >
            <Home className="w-4 h-4" />
            العودة للرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}
