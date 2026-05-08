import { Save, Check } from 'lucide-react';
import type { NotifSettings } from './settingsConstants';
import { notificationOptions } from './settingsConstants';

interface NotificationsTabProps {
  settings: NotifSettings;
  onChange: (updated: NotifSettings) => void;
  saved: boolean;
  onSave: () => void;
}

export default function NotificationsTab({
  settings,
  onChange,
  saved,
  onSave,
}: NotificationsTabProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h2 className="text-gray-900 mb-6" style={{ fontSize: '18px', fontWeight: 700 }}>
        إعدادات الإشعارات
      </h2>
      <div className="space-y-4">
        {notificationOptions.map((n) => (
          <div key={n.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                {n.label}
              </p>
              <p className="text-gray-500" style={{ fontSize: '12px' }}>
                {n.desc}
              </p>
            </div>
            <button
              onClick={() => onChange({ ...settings, [n.key]: !settings[n.key] })}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${settings[n.key] ? 'bg-green-600' : 'bg-gray-300'}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${settings[n.key] ? 'right-0.5' : 'left-0.5'}`}
              />
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-6">
        <button
          onClick={onSave}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-white transition-all ${saved ? 'bg-green-500' : 'bg-green-600 hover:bg-green-700'}`}
          style={{ fontSize: '14px', fontWeight: 600 }}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" /> تم الحفظ
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> حفظ
            </>
          )}
        </button>
      </div>
    </div>
  );
}
