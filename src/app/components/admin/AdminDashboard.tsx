import { useNavigate } from 'react-router';
import { Users, Megaphone, UserCog, Droplets, TrendingUp, AlertTriangle, ArrowUpRight, Heart, Building2, Smartphone } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { donors, campaigns, users, bloodInventory, monthlyStats } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';

const donationTypeLabels: Record<string, string> = { whole: 'دم كامل', plasma: 'بلازما', platelets: 'صفائح' };
const statusColors: Record<string, string> = { eligible: 'bg-green-100 text-green-700', ineligible: 'bg-red-100 text-red-700', deferred: 'bg-orange-100 text-orange-700' };
const statusLabels: Record<string, string> = { eligible: 'مؤهل', ineligible: 'غير مؤهل', deferred: 'موجل' };
const bloodStatusColor: Record<string, string> = { normal: 'bg-green-500', low: 'bg-yellow-500', critical: 'bg-red-500' };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const doctors = users.filter(u => u.role === 'doctor');
  const labDoctors = users.filter(u => u.role === 'lab');
  const totalUnits = bloodInventory.reduce((s, b) => s + b.units, 0);
  const criticalCount = bloodInventory.filter(b => b.status === 'critical').length;
  const recentDonors = [...donors].sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()).slice(0, 6);
  const campaignDonors = donors.filter(d => d.source === 'campaign');
  const walkinDonors = donors.filter(d => d.source === 'walkin');
  const appDonors = donors.filter(d => d.source === 'app');

  const stats = [
    { label: 'إجمالي المتبرعين', value: donors.length, sub: `${donors.filter(d => d.status === 'eligible').length} مؤهل`, icon: Heart, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', action: () => navigate('/admin/donors') },
    { label: 'حملات التبرع', value: campaigns.length, sub: `${campaigns.filter(c => c.status === 'active').length} نشطة`, icon: Megaphone, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', action: () => navigate('/admin/campaigns') },
    { label: 'الكوادر الطبية', value: doctors.length + labDoctors.length, sub: `${doctors.length} طبيب • ${labDoctors.length} تحاليل`, icon: UserCog, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', action: () => navigate('/admin/staff') },
    { label: 'وحدات الدم المتاحة', value: totalUnits, sub: `${criticalCount} فصائل حرجة`, icon: Droplets, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', action: () => navigate('/admin/inventory') },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: '22px', fontWeight: 800 }}>لوحة التحكم</h1>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: '14px' }}>مرحباً {user?.name} — الأحد، 26 أبريل 2025</p>
        </div>
        {criticalCount > 0 && (
          <button onClick={() => navigate('/admin/inventory')}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl hover:bg-red-100 transition-all"
            style={{ fontSize: '13px', fontWeight: 600 }}>
            <AlertTriangle className="w-4 h-4" />
            {criticalCount} فصائل تحتاج تجديد
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <button key={i} onClick={s.action} className={`bg-white rounded-2xl p-5 border ${s.border} shadow-sm hover:shadow-md transition-all text-right`}>
            <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center mb-4`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className="text-gray-900" style={{ fontSize: '30px', fontWeight: 800 }}>{s.value}</div>
            <div className="text-gray-700 mt-0.5" style={{ fontSize: '13px', fontWeight: 600 }}>{s.label}</div>
            <div className="text-gray-400 mt-0.5" style={{ fontSize: '12px' }}>{s.sub}</div>
          </button>
        ))}
      </div>

      {/* Donor Sources */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-green-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-gray-900" style={{ fontSize: '26px', fontWeight: 800 }}>{walkinDonors.length}</div>
            <div className="text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>تبرع داخل البنك</div>
            <div className="text-gray-400" style={{ fontSize: '11px' }}>{Math.round((walkinDonors.length / donors.length) * 100)}% من الإجمالي</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Megaphone className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <div className="text-gray-900" style={{ fontSize: '26px', fontWeight: 800 }}>{campaignDonors.length}</div>
            <div className="text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>عن طريق حملة</div>
            <div className="text-gray-400" style={{ fontSize: '11px' }}>{Math.round((campaignDonors.length / donors.length) * 100)}% من الإجمالي</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="text-gray-900" style={{ fontSize: '26px', fontWeight: 800 }}>{appDonors.length}</div>
            <div className="text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>حجز من التطبيق</div>
            <div className="text-gray-400" style={{ fontSize: '11px' }}>{Math.round((appDonors.length / donors.length) * 100)}% من الإجمالي</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donation Trends */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-gray-900" style={{ fontSize: '16px', fontWeight: 700 }}>اتجاهات التبرع</h2>
              <p className="text-gray-400" style={{ fontSize: '12px' }}>عدد التبرعات والمتبرعين الجدد شهرياً</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-600" /><span className="text-gray-500" style={{ fontSize: '12px' }}>تبرعات</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-400" /><span className="text-gray-500" style={{ fontSize: '12px' }}>متبرعون جدد</span></div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyStats}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis key="x-axis" dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'Tajawal' }} />
              <YAxis key="y-axis" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <Tooltip key="tooltip" contentStyle={{ fontFamily: 'Tajawal', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '13px' }} />
              <Line key="line-donations" type="monotone" dataKey="donations" stroke="#16a34a" strokeWidth={2.5} dot={false} name="التبرعات" />
              <Line key="line-newDonors" type="monotone" dataKey="newDonors" stroke="#60a5fa" strokeWidth={2.5} dot={false} name="متبرعون جدد" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Blood Inventory */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-gray-900" style={{ fontSize: '16px', fontWeight: 700 }}>مخزون الدم</h2>
            <button onClick={() => navigate('/admin/inventory')} className="text-green-600 hover:underline" style={{ fontSize: '12px' }}>عرض الكل</button>
          </div>
          <div className="space-y-3">
            {bloodInventory.map(b => (
              <div key={`inv-${b.type}`} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600" style={{ fontSize: '12px', fontWeight: 800 }}>{b.type}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700" style={{ fontSize: '12px', fontWeight: 600 }}>{b.units} وحدة</span>
                    <span className={`px-2 py-0.5 rounded-full text-white ${bloodStatusColor[b.status]}`} style={{ fontSize: '10px', fontWeight: 700 }}>
                      {b.status === 'normal' ? 'طبيعي' : b.status === 'low' ? 'منخفض' : 'حرج'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${bloodStatusColor[b.status]}`} style={{ width: `${Math.min((b.units / 50) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Donors + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Donors */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-gray-900" style={{ fontSize: '16px', fontWeight: 700 }}>أحدث المتبرعين</h2>
            <button onClick={() => navigate('/admin/donors')} className="flex items-center gap-1 text-green-600 hover:underline" style={{ fontSize: '12px' }}>
              عرض الكل <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  {['رمز المتبرع', 'الاسم', 'المدينة', 'الفصيلة', 'نوع التبرع', 'الحالة', 'إجراء'].map(h => (
                    <th key={h} className="px-4 py-3 text-right text-gray-500" style={{ fontSize: '12px', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentDonors.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3"><span className="font-mono text-green-600 bg-green-50 px-2 py-0.5 rounded" style={{ fontSize: '11px', fontWeight: 700 }}>{d.donorCode}</span></td>
                    <td className="px-4 py-3"><span className="text-gray-900" style={{ fontSize: '13px', fontWeight: 600 }}>{d.name}</span></td>
                    <td className="px-4 py-3"><span className="text-gray-500" style={{ fontSize: '13px' }}>{d.city}</span></td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-red-50 text-red-600 rounded" style={{ fontSize: '12px', fontWeight: 700 }}>{d.bloodType}</span></td>
                    <td className="px-4 py-3"><span className="text-gray-500" style={{ fontSize: '12px' }}>{donationTypeLabels[d.donationType]}</span></td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full ${d.status === 'eligible' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                        style={{ fontSize: '11px', fontWeight: 600 }}>
                        {d.status === 'eligible' ? 'مؤهل' : 'غير مؤهل'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => navigate('/admin/donors')} className="text-green-600 hover:text-green-700 px-2 py-1 rounded-lg hover:bg-green-50 transition-all" style={{ fontSize: '12px', fontWeight: 600 }}>تعديل</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-gray-900 mb-5" style={{ fontSize: '16px', fontWeight: 700 }}>تنبيهات النظام</h2>
          <div className="space-y-3">
            {bloodInventory.filter(b => b.status !== 'normal').map(b => (
              <div key={`alert-${b.type}`} className={`flex items-start gap-3 p-3 rounded-xl ${b.status === 'critical' ? 'bg-red-50 border border-red-100' : 'bg-yellow-50 border border-yellow-100'}`}>
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${b.status === 'critical' ? 'text-red-500' : 'text-yellow-500'}`} />
                <div>
                  <p className={`${b.status === 'critical' ? 'text-red-700' : 'text-yellow-700'}`} style={{ fontSize: '13px', fontWeight: 600 }}>
                    مخزون {b.type} {b.status === 'critical' ? 'حرج' : 'منخفض'}
                  </p>
                  <p className={`${b.status === 'critical' ? 'text-red-500' : 'text-yellow-600'}`} style={{ fontSize: '12px' }}>
                    متبقي {b.units} وحدات (الحد الأدنى: {b.minRequired})
                  </p>
                </div>
              </div>
            ))}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
              <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-700" style={{ fontSize: '13px', fontWeight: 600 }}>ارتفاع التبرعات</p>
                <p className="text-green-600" style={{ fontSize: '12px' }}>زيادة 15% مقارنة بالشهر السابق</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
              <Users className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-700" style={{ fontSize: '13px', fontWeight: 600 }}>حملة جديدة قيد التنفيذ</p>
                <p className="text-blue-600" style={{ fontSize: '12px' }}>حملة مستشفى ناصر - 42 متبرع</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}