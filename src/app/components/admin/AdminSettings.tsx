import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';


// ── Constants & types ──
import type { FacilityInfo, NotifSettings } from './admin-settings/settingsConstants';
import {
  settingsTabs,
  defaultFacilityInfo,
  defaultNotifSettings,
} from './admin-settings/settingsConstants';

// ── Tab sub-components ──
import FacilityTab from './admin-settings/FacilityTab';
import SecurityTab from './admin-settings/SecurityTab';
import NotificationsTab from './admin-settings/NotificationsTab';

import PermissionsTab from './admin-settings/PermissionsTab';

export default function AdminSettings() {
  useAuth();


  const [activeTab, setActiveTab] = useState('system');
  const [saved, setSaved] = useState(false);
  const [sysInfo, setSysInfo] = useState<FacilityInfo>(defaultFacilityInfo);
  const [notifSettings, setNotifSettings] = useState<NotifSettings>(defaultNotifSettings);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900" style={{ fontSize: '22px', fontWeight: 800 }}>
          الإعدادات
        </h1>
        <p className="text-gray-500" style={{ fontSize: '14px' }}>
          إدارة إعدادات النظام والمنشأة
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {settingsTabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-right transition-all border-b border-gray-50 last:border-0 ${activeTab === t.id ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <t.icon
                  className={`w-5 h-5 ${activeTab === t.id ? 'text-green-600' : 'text-gray-400'}`}
                />
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: activeTab === t.id ? 700 : 500,
                  }}
                >
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-3">
          {activeTab === 'system' && (
            <FacilityTab
              sysInfo={sysInfo}
              onChange={setSysInfo}
              saved={saved}
              onSave={handleSave}
            />
          )}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'notifications' && (
            <NotificationsTab
              settings={notifSettings}
              onChange={setNotifSettings}
              saved={saved}
              onSave={handleSave}
            />
          )}

          {activeTab === 'permissions' && <PermissionsTab />}
        </div>
      </div>
    </div>
  );
}
