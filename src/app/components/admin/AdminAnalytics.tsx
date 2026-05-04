import { useState } from 'react';
import { TrendingUp, BarChart3, PieChart, Map, Download } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart as RPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import { donationTrends, areaData, bloodTypeDistribution } from '../../data/mockData';

const shortageData = [
  { month: 'مايو', predicted: 220, current: 198 },
  { month: 'يونيو', predicted: 180, current: 165 },
  { month: 'يوليو', predicted: 150, current: 134 },
  { month: 'أغسطس', predicted: 195, current: null },
  { month: 'سبتمبر', predicted: 255, current: null },
  { month: 'أكتوبر', predicted: 285, current: null },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-3" dir="rtl">
        <p className="text-[#1E293B] mb-1" style={{ fontSize: '13px', fontWeight: 600 }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color, fontSize: '12px' }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminAnalytics() {
  const [period, setPeriod] = useState('yearly');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#1E293B]" style={{ fontSize: '22px', fontWeight: 700 }}>التحليلات والتقارير</h1>
          <p className="text-gray-400 mt-1" style={{ fontSize: '13px' }}>رؤى شاملة عن أداء بنك الدم</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
            {['monthly', 'quarterly', 'yearly'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-4 py-2.5 transition-all ${period === p ? 'bg-[#C62828] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                style={{ fontSize: '13px', fontWeight: 600 }}>
                {p === 'monthly' ? 'شهري' : p === 'quarterly' ? 'ربع سنوي' : 'سنوي'}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all" style={{ fontSize: '14px', fontWeight: 600 }}>
            <Download className="w-4 h-4" />تصدير
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'معدل التبرع اليومي', value: '41', unit: 'وحدة/يوم', change: '+8%', icon: '📈', color: 'border-green-100' },
          { label: 'رضا المتبرعين', value: '94%', unit: 'تقييم ممتاز', change: '+2%', icon: '⭐', color: 'border-yellow-100' },
          { label: 'كفاءة المخزون', value: '78%', unit: 'نسبة الاستخدام', change: '-3%', icon: '🩸', color: 'border-red-100' },
          { label: 'وقت المعالجة', value: '2.4', unit: 'ساعة متوسطاً', change: '-12%', icon: '⏱️', color: 'border-blue-100' },
        ].map((k, i) => (
          <div key={i} className={`bg-white rounded-2xl p-5 border ${k.color} shadow-sm`}>
            <div className="text-2xl mb-3">{k.icon}</div>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-[#1E293B]" style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1 }}>{k.value}</span>
              <span className="text-gray-400 mb-1" style={{ fontSize: '12px' }}>{k.unit}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500" style={{ fontSize: '12px' }}>{k.label}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${k.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{k.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donation Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[#1E293B]" style={{ fontSize: '16px', fontWeight: 700 }}>اتجاهات التبرع السنوية</h2>
              <p className="text-gray-400" style={{ fontSize: '12px' }}>عدد التبرعات والطلبات شهرياً</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#C62828]"></div><span className="text-gray-500">التبرعات</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#1976D2]"></div><span className="text-gray-500">الطلبات</span></div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={donationTrends}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C62828" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#C62828" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1976D2" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1976D2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="donations" stroke="#C62828" strokeWidth={2.5} fill="url(#g1)" name="التبرعات" />
              <Area type="monotone" dataKey="requests" stroke="#1976D2" strokeWidth={2.5} fill="url(#g2)" name="الطلبات" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Blood Type Distribution Pie */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-[#1E293B] mb-1" style={{ fontSize: '16px', fontWeight: 700 }}>توزيع فصائل الدم</h2>
          <p className="text-gray-400 mb-4" style={{ fontSize: '12px' }}>نسبة كل فصيلة من المتبرعين</p>
          <ResponsiveContainer width="100%" height={180}>
            <RPieChart>
              <Pie data={bloodTypeDistribution} dataKey="value" nameKey="type" cx="50%" cy="50%" outerRadius={75} innerRadius={40}>
                {bloodTypeDistribution.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'النسبة']} contentStyle={{ fontFamily: 'Cairo', borderRadius: '8px' }} />
            </RPieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {bloodTypeDistribution.map((d) => (
              <div key={d.type} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }}></div>
                <span className="text-gray-600" style={{ fontSize: '11px' }}>{d.type}: {d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Area & Shortage Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Based */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Map className="w-5 h-5 text-[#C62828]" />
            <div>
              <h2 className="text-[#1E293B]" style={{ fontSize: '16px', fontWeight: 700 }}>تحليل المناطق</h2>
              <p className="text-gray-400" style={{ fontSize: '12px' }}>العرض والطلب حسب المنطقة</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={areaData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="area" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="donations" fill="#C62828" name="التبرعات" radius={[4, 4, 0, 0]} />
              <Bar dataKey="demand" fill="#FFCDD2" name="الطلب" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Shortage Prediction */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-[#F57C00]" />
            <h2 className="text-[#1E293B]" style={{ fontSize: '16px', fontWeight: 700 }}>توقعات النقص</h2>
          </div>
          <p className="text-gray-400 mb-5" style={{ fontSize: '12px' }}>تحليل تنبؤي لمستويات المخزون</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={shortageData}>
              <defs>
                <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F57C00" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#F57C00" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C62828" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#C62828" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="predicted" stroke="#F57C00" strokeWidth={2} strokeDasharray="5 5" fill="url(#gp)" name="المتوقع" />
              <Area type="monotone" dataKey="current" stroke="#C62828" strokeWidth={2.5} fill="url(#gc)" name="الحالي" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-3 bg-orange-50 border border-orange-100 rounded-xl p-3">
            <p className="text-orange-700" style={{ fontSize: '12px', fontWeight: 600 }}>⚠️ تحذير: يُتوقع نقص في فصيلة O- خلال أغسطس القادم</p>
          </div>
        </div>
      </div>
    </div>
  );
}
