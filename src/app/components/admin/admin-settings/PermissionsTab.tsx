import { Check } from 'lucide-react';
import { permissionsData } from './settingsConstants';

export default function PermissionsTab() {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
      <h2 className="text-foreground mb-6" style={{ fontSize: '18px', fontWeight: 700 }}>
        صلاحيات الأدوار
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/40">
              <th
                className="px-4 py-3 text-right text-muted-foreground"
                style={{ fontSize: '12px', fontWeight: 600 }}
              >
                الصلاحية
              </th>
              <th
                className="px-4 py-3 text-center text-muted-foreground"
                style={{ fontSize: '12px', fontWeight: 600 }}
              >
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                  مدير عام
                </span>
              </th>
              <th
                className="px-4 py-3 text-center text-muted-foreground"
                style={{ fontSize: '12px', fontWeight: 600 }}
              >
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">طبيب</span>
              </th>
              <th
                className="px-4 py-3 text-center text-muted-foreground"
                style={{ fontSize: '12px', fontWeight: 600 }}
              >
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                  دكتور تحاليل
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {permissionsData.map(([label, admin, doc, lab], i) => (
              <tr key={i} className="hover:bg-muted/40">
                <td
                  className="px-4 py-3 text-foreground"
                  style={{ fontSize: '13px', fontWeight: 500 }}
                >
                  {label}
                </td>
                <td className="px-4 py-3 text-center">
                  {admin ? (
                    <Check className="w-5 h-5 text-green-600 mx-auto" />
                  ) : (
                    <span className="text-muted-foreground/50">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {doc ? (
                    <Check className="w-5 h-5 text-blue-600 mx-auto" />
                  ) : (
                    <span className="text-muted-foreground/50">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {lab ? (
                    <Check className="w-5 h-5 text-purple-600 mx-auto" />
                  ) : (
                    <span className="text-muted-foreground/50">—</span>
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
