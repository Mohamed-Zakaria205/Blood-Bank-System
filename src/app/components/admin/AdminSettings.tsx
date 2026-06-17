import { useState } from 'react';
import { toast } from 'sonner';
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
import EligibilityTab from './admin-settings/EligibilityTab';

export default function AdminSettings() {
  useAuth();

  const [activeTab, setActiveTab] = useState('system');
  const [saved, setSaved] = useState(false);
  const [sysInfo, setSysInfo] = useState<FacilityInfo>(defaultFacilityInfo);
  const [notifSettings, setNotifSettings] = useState<NotifSettings>(defaultNotifSettings);

  const handleSave = () => {
    toast.success('تم حفظ الإعدادات بنجاح');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-foreground" style={{ fontSize: '22px', fontWeight: 800 }}>
          الإعدادات
        </h1>
        <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
          إدارة إعدادات النظام والمنشأة
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            {settingsTabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-right transition-all border-b border-border last:border-0 ${activeTab === t.id ? 'bg-green-50 text-green-700' : 'text-muted-foreground hover:bg-muted/40'}`}
              >
                <t.icon
                  className={`w-5 h-5 ${activeTab === t.id ? 'text-green-600' : 'text-muted-foreground'}`}
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
          {activeTab === 'eligibility' && <EligibilityTab />}
        </div>
      </div>
    </div>
  );
}
