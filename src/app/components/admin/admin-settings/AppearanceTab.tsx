import { Sun, Moon, Monitor, Check } from 'lucide-react';

interface AppearanceTabProps {
  isDark: boolean;
  toggleDark: () => void;
}

export default function AppearanceTab({ isDark, toggleDark }: AppearanceTabProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h2 className="text-gray-900 mb-2" style={{ fontSize: '18px', fontWeight: 700 }}>
        إعدادات المظهر
      </h2>
      <p className="text-gray-500 mb-6" style={{ fontSize: '13px' }}>
        اختر واجهة تناسب بيئة عملك
      </p>

      {/* Mode Toggle */}
      <div className="mb-6">
        <p className="text-gray-700 mb-3" style={{ fontSize: '14px', fontWeight: 600 }}>
          وضع العرض
        </p>
        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <button
            onClick={() => {
              if (isDark) toggleDark();
            }}
            className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
              !isDark
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${!isDark ? 'bg-green-100' : 'bg-gray-100'}`}
            >
              <Sun className={`w-5 h-5 ${!isDark ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <div className="text-center">
              <p
                className={`${!isDark ? 'text-green-700' : 'text-gray-600'}`}
                style={{ fontSize: '13px', fontWeight: 700 }}
              >
                وضع النهار
              </p>
              <p className="text-gray-400" style={{ fontSize: '11px' }}>
                خلفية بيضاء
              </p>
            </div>
            {!isDark && (
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>

          <button
            onClick={() => {
              if (!isDark) toggleDark();
            }}
            className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
              isDark
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-green-100' : 'bg-gray-100'}`}
            >
              <Moon className={`w-5 h-5 ${isDark ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <div className="text-center">
              <p
                className={`${isDark ? 'text-green-700' : 'text-gray-600'}`}
                style={{ fontSize: '13px', fontWeight: 700 }}
              >
                وضع الليل
              </p>
              <p className="text-gray-400" style={{ fontSize: '11px' }}>
                خلفية داكنة طبية
              </p>
            </div>
            {isDark && (
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Dark mode info card */}
      <div className="p-4 bg-green-50 border border-green-100 rounded-xl max-w-sm">
        <div className="flex items-start gap-3">
          <Monitor className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-700" style={{ fontSize: '13px', fontWeight: 600 }}>
              وضع الليل الطبي
            </p>
            <p className="text-green-600" style={{ fontSize: '12px', marginTop: '4px' }}>
              تصميم هادئ بخلفية خضراء داكنة مريحة للعين — مثالي للاستخدام في البيئات الطبية ليلاً
            </p>
          </div>
        </div>
      </div>

      {/* Current status indicator */}
      <div className="mt-4 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-green-500' : 'bg-yellow-400'}`} />
        <span className="text-gray-500" style={{ fontSize: '12px' }}>
          الوضع الحالي:{' '}
          <span className="text-gray-700" style={{ fontWeight: 600 }}>
            {isDark ? 'وضع الليل' : 'وضع النهار'}
          </span>
          &nbsp;— يتم حفظ تفضيلك تلقائياً
        </span>
      </div>
    </div>
  );
}
