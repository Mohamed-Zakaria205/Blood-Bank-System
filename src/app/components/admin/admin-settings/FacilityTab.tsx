import { Save, Check } from 'lucide-react';
import type { FacilityInfo } from './settingsConstants';
import { facilityFields } from './settingsConstants';

interface FacilityTabProps {
  sysInfo: FacilityInfo;
  onChange: (updated: FacilityInfo) => void;
  saved: boolean;
  onSave: () => void;
}

export default function FacilityTab({ sysInfo, onChange, saved, onSave }: FacilityTabProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h2 className="text-gray-900 mb-6" style={{ fontSize: '18px', fontWeight: 700 }}>
        بيانات المنشأة الصحية
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {facilityFields.map((f) => (
          <div key={f.key} className={f.key === 'workingHours' ? 'col-span-2' : ''}>
            <label
              className="block text-gray-700 mb-1.5"
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              {f.label}
            </label>
            <input
              type={f.type}
              value={sysInfo[f.key]}
              onChange={(e) => onChange({ ...sysInfo, [f.key]: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
              style={{ fontSize: '13px' }}
            />
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
              <Save className="w-4 h-4" /> حفظ التغييرات
            </>
          )}
        </button>
      </div>
    </div>
  );
}
