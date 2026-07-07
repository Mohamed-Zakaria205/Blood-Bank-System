import { useState, useRef } from 'react';
import {
  RefreshCw,
  ExternalLink,
  BarChart3,
  Loader2,
} from 'lucide-react';

// URL with query parameters to hide the Power BI chrome:
// navContentPaneEnabled=false: Hides the bottom navigation pages.
// filterPaneEnabled=false: Hides the right-side filter pane.
// actionBarEnabled=false: Hides the Power BI action bar.
const POWERBI_REPORT_URL =
  'https://app.powerbi.com/reportEmbed?reportId=218fc288-f511-4cd9-aab1-ee594143d4f3&autoAuth=true&ctid=d1aad15a-5724-45cd-a320-5e75718fa6bd&navContentPaneEnabled=false&filterPaneEnabled=false&actionBarEnabled=false';

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleLoad = () => setLoading(false);
  const handleRefresh = () => {
    setLoading(true);
    setIframeKey((k) => k + 1);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-foreground" style={{ fontSize: '22px', fontWeight: 800 }}>
            التقارير والتحليلات
          </h1>
          <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
            لوحة Power BI المتكاملة لإحصاءات بنك الدم
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2.5 border border-border text-muted-foreground rounded-xl hover:bg-muted/40 transition-all"
            style={{ fontSize: '13px', fontWeight: 600 }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> تحديث
          </button>
          <button
            onClick={() => window.open(POWERBI_REPORT_URL, '_blank')}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all"
            style={{ fontSize: '13px', fontWeight: 600 }}
          >
            <ExternalLink className="w-4 h-4" /> فتح في نافذة جديدة
          </button>
        </div>
      </div>

      {/* Power BI Embed */}
      {/* 
        Note: Some internal Power BI UI elements (like the top toolbar, specific page navigation menus inside the report, etc.) 
        cannot be hidden via query parameters or CSS from the frontend because they are rendered inside a cross-origin iframe. 
        Controlling these deeper UI elements requires using the official Power BI Javascript Embed SDK and configuring the report 
        from the Power BI service directly.
      */}
      <div className="relative w-full flex-1 min-h-[400px]">
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-muted/40 flex flex-col items-center justify-center z-10 rounded-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex items-center gap-2 justify-center mb-2">
                <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                <p className="text-foreground" style={{ fontSize: '16px', fontWeight: 600 }}>
                  جاري تحميل لوحة Power BI...
                </p>
              </div>
              <p className="text-muted-foreground" style={{ fontSize: '13px' }}>
                يرجى الانتظار
              </p>
            </div>
          </div>
        )}

        {/* iframe */}
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={POWERBI_REPORT_URL}
          onLoad={handleLoad}
          className="w-full h-full rounded-2xl border border-border bg-card shadow-sm"
          title="BloodLinkAnalytics_2"
          allowFullScreen
          style={{ opacity: loading ? 0 : 1, transition: 'opacity 0.3s' }}
        />
      </div>
    </div>
  );
}
