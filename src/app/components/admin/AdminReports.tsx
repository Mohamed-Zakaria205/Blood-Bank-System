import { useState, useRef } from 'react';
import {
  Maximize2,
  Minimize2,
  RefreshCw,
  ExternalLink,
  Settings2,
  Copy,
  Check,
  Info,
  BarChart3,
  Loader2,
} from 'lucide-react';

const DEFAULT_POWERBI_URL =
  'https://app.powerbi.com/view?r=eyJrIjoiOGRlMjMyZTctM2I4Ni00YzM2LWFmMGQtNTc4YWJiNzJhYTY2IiwidCI6ImQxNzU2NzBiLWQxM2EtNDgxNi04ZTM1LWRhYTNkOTI1MTVmMSIsImMiOjl9';

export default function AdminReports() {
  const [url, setUrl] = useState(DEFAULT_POWERBI_URL);
  const [inputUrl, setInputUrl] = useState(DEFAULT_POWERBI_URL);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleLoad = () => setLoading(false);
  const handleRefresh = () => {
    setLoading(true);
    setIframeKey((k) => k + 1);
  };
  const applyUrl = () => {
    setUrl(inputUrl);
    setLoading(true);
    setIframeKey((k) => k + 1);
    setShowSettings(false);
  };
  const copyUrl = () => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const EmbedContainer = () => (
    <div
      className="relative w-full"
      style={{ height: fullscreen ? '100vh' : 'calc(100vh - 280px)', minHeight: '500px' }}
    >
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-muted/40 flex flex-col items-center justify-center z-10 rounded-xl">
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
        src={url}
        onLoad={handleLoad}
        className="w-full h-full rounded-xl border border-border"
        title="Power BI Dashboard - BloodLink"
        allowFullScreen
        style={{ opacity: loading ? 0 : 1, transition: 'opacity 0.3s' }}
      />
    </div>
  );

  return (
    <>
      {/* Fullscreen mode */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-card p-4" dir="rtl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-foreground" style={{ fontSize: '16px', fontWeight: 700 }}>
                  التقارير والتحليلات - Power BI
                </p>
                <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
                  BloodLink — محافظة بني سويف
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-1.5 px-3 py-2 border border-border text-muted-foreground rounded-xl hover:bg-muted/40 transition-all"
                style={{ fontSize: '12px' }}
              >
                <RefreshCw className="w-4 h-4" /> تحديث
              </button>
              <button
                onClick={() => setFullscreen(false)}
                className="flex items-center gap-1.5 px-3 py-2 border border-border text-muted-foreground rounded-xl hover:bg-muted/40 transition-all"
                style={{ fontSize: '12px' }}
              >
                <Minimize2 className="w-4 h-4" /> تصغير
              </button>
            </div>
          </div>
          <EmbedContainer />
        </div>
      )}

      {/* Normal mode */}
      {!fullscreen && (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                onClick={() => setShowSettings(!showSettings)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-all ${showSettings ? 'border-green-400 bg-green-50 text-green-700' : 'border-border text-muted-foreground hover:bg-muted/40'}`}
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                <Settings2 className="w-4 h-4" /> الإعدادات
              </button>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2.5 border border-border text-muted-foreground rounded-xl hover:bg-muted/40 transition-all"
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> تحديث
              </button>
              <button
                onClick={() => setFullscreen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all"
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                <Maximize2 className="w-4 h-4" /> ملء الشاشة
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-card rounded-2xl p-5 border border-green-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Settings2 className="w-4 h-4 text-green-600" />
                <h3 className="text-foreground" style={{ fontSize: '15px', fontWeight: 700 }}>
                  إعدادات Power BI
                </h3>
              </div>
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl mb-4">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-blue-700" style={{ fontSize: '12px' }}>
                  أدخل رابط تضمين Power BI الخاص بك (Embed URL). يمكنك الحصول عليه من: Power BI →
                  تقرير → مشاركة → تضمين تقرير → موقع ويب أو مدخل
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label
                    className="block text-foreground mb-1.5"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    رابط التضمين (Embed URL)
                  </label>
                  <input
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://app.powerbi.com/view?r=..."
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                    style={{ fontSize: '12px' }}
                    dir="ltr"
                  />
                </div>
                <div className="flex flex-col gap-2 justify-end">
                  <button
                    onClick={applyUrl}
                    className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all whitespace-nowrap"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    تطبيق
                  </button>
                  <button
                    onClick={copyUrl}
                    className="px-4 py-2.5 border border-border text-muted-foreground hover:bg-muted/40 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-600" /> تم
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> نسخ
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  {
                    title: 'كيفية الحصول على Embed URL',
                    steps: [
                      'افتح التقرير في Power BI',
                      'اضغط مشاركة > تضمين تقرير',
                      'اختر "موقع ويب أو مدخل"',
                      'انسخ الرابط من الحقل src',
                    ],
                  },
                ].map((tip, i) => (
                  <div key={i} className="col-span-3 p-4 bg-muted/40 rounded-xl">
                    <p
                      className="text-foreground mb-2"
                      style={{ fontSize: '13px', fontWeight: 700 }}
                    >
                      {tip.title}
                    </p>
                    <ol className="space-y-1">
                      {tip.steps.map((s, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2 text-muted-foreground"
                          style={{ fontSize: '12px' }}
                        >
                          <span
                            className="w-4 h-4 bg-green-100 text-green-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ fontSize: '10px', fontWeight: 700 }}
                          >
                            {j + 1}
                          </span>
                          {s}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info bar */}
          <div className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-foreground" style={{ fontSize: '14px', fontWeight: 700 }}>
                  لوحة تحكم Power BI
                </p>
                <p className="text-muted-foreground truncate max-w-xs" style={{ fontSize: '11px' }}>
                  {url}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-green-600 animate-spin" />
                  <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
                    جاري التحميل...
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-600" style={{ fontSize: '12px', fontWeight: 600 }}>
                    متصل
                  </span>
                </div>
              )}
              <button
                onClick={() => window.open(url, '_blank')}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-muted-foreground hover:bg-muted/40 rounded-lg transition-all"
                style={{ fontSize: '12px' }}
              >
                <ExternalLink className="w-3.5 h-3.5" /> فتح في نافذة جديدة
              </button>
            </div>
          </div>

          {/* Power BI Embed */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden p-2">
            <EmbedContainer />
          </div>

          {/* Footer Note */}
          <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-amber-700" style={{ fontSize: '12px' }}>
              لوحة Power BI مُدارة خارجياً. لتحديث الرابط، اضغط على زر "الإعدادات" وأدخل رابط
              التضمين الجديد. يتم تحميل اللوحة من خوادم Microsoft مباشرةً.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
