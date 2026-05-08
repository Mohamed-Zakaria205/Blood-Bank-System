import { Check } from 'lucide-react';
import { permissionsData } from './settingsConstants';

export default function PermissionsTab() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h2 className="text-gray-900 mb-6" style={{ fontSize: '18px', fontWeight: 700 }}>
        صلاحيات الأدوار
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th
                className="px-4 py-3 text-right text-gray-500"
                style={{ fontSize: '12px', fontWeight: 600 }}
              >
                الصلاحية
              </th>
              <th
                className="px-4 py-3 text-center text-gray-500"
                style={{ fontSize: '12px', fontWeight: 600 }}
              >
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                  مدير عام
                </span>
              </th>
              <th
                className="px-4 py-3 text-center text-gray-500"
                style={{ fontSize: '12px', fontWeight: 600 }}
              >
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">طبيب</span>
              </th>
              <th
                className="px-4 py-3 text-center text-gray-500"
                style={{ fontSize: '12px', fontWeight: 600 }}
              >
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                  دكتور تحاليل
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {permissionsData.map(([label, admin, doc, lab], i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td
                  className="px-4 py-3 text-gray-700"
                  style={{ fontSize: '13px', fontWeight: 500 }}
                >
                  {label}
                </td>
                <td className="px-4 py-3 text-center">
                  {admin ? (
                    <Check className="w-5 h-5 text-green-600 mx-auto" />
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {doc ? (
                    <Check className="w-5 h-5 text-blue-600 mx-auto" />
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {lab ? (
                    <Check className="w-5 h-5 text-purple-600 mx-auto" />
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
