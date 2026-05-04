import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Home, Calendar, Clock, User, Bell, Heart, Droplets, MapPin, Trophy,
  ArrowRight, ChevronRight, AlertTriangle, CheckCircle2, Star, Gift,
  Phone, LogIn, UserPlus, Shield, Activity, X, ArrowLeft, Search,
  Flame, Award, TrendingUp
} from 'lucide-react';
import { donorHistory, leaderboard, notifications } from '../../data/mockData';

type Screen = 'login' | 'register' | 'home' | 'book' | 'eligibility' | 'history' | 'profile' | 'leaderboard' | 'notifications' | 'emergency' | 'map' | 'bookSuccess';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const navItems = [
  { id: 'home', label: 'الرئيسية', icon: Home },
  { id: 'history', label: 'سجلاتي', icon: Clock },
  { id: 'leaderboard', label: 'المتصدرون', icon: Trophy },
  { id: 'notifications', label: 'الإشعارات', icon: Bell },
  { id: 'profile', label: 'حسابي', icon: User },
];

function LoginScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [email, setEmail] = useState('donor@bloodbank.sa');
  const [password, setPassword] = useState('Donor@2025');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    onNavigate('home');
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F9FC]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#C62828] to-[#B71C1C] px-6 pt-12 pb-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-white blur-2xl"></div>
          <div className="absolute bottom-4 left-4 w-20 h-20 rounded-full bg-white blur-2xl"></div>
        </div>
        <div className="relative">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Droplets className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-white mb-1" style={{ fontSize: '22px', fontWeight: 800 }}>بنك الدم</h1>
          <p className="text-red-200" style={{ fontSize: '14px' }}>تطبيق المتبرعين</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 pt-6 overflow-y-auto pb-6">
        <h2 className="text-[#1E293B] mb-1" style={{ fontSize: '20px', fontWeight: 700 }}>مرحباً بعودتك 👋</h2>
        <p className="text-gray-400 mb-6" style={{ fontSize: '13px' }}>سجّل دخولك للمتابعة</p>

        <div className="space-y-4 mb-5">
          <div>
            <label className="block text-[#374151] mb-1.5" style={{ fontSize: '13px', fontWeight: 600 }}>البريد الإلكتروني</label>
            <input value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#C62828] shadow-sm"
              style={{ fontSize: '13px' }} dir="ltr" />
          </div>
          <div>
            <label className="block text-[#374151] mb-1.5" style={{ fontSize: '13px', fontWeight: 600 }}>كلمة المرور</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#C62828] shadow-sm"
              style={{ fontSize: '13px' }} dir="ltr" />
          </div>
        </div>

        <button onClick={handleLogin} disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C62828] to-[#B71C1C] text-white shadow-lg hover:shadow-xl transition-all mb-4 disabled:opacity-70"
          style={{ fontSize: '15px', fontWeight: 700 }}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              جارٍ الدخول...
            </span>
          ) : 'تسجيل الدخول'}
        </button>

        <button onClick={() => onNavigate('register')} className="w-full py-4 rounded-2xl border-2 border-[#C62828] text-[#C62828] hover:bg-red-50 transition-all" style={{ fontSize: '14px', fontWeight: 600 }}>
          إنشاء حساب جديد
        </button>

        <p className="text-center text-gray-400 mt-4" style={{ fontSize: '12px' }}>🔒 بياناتك محمية ومشفرة</p>
      </div>
    </div>
  );
}

function RegisterScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', phone: '', bloodType: 'O+', age: '', city: 'الرياض', email: '', password: '' });

  return (
    <div className="flex flex-col h-full bg-[#F8F9FC]">
      <div className="bg-gradient-to-r from-[#C62828] to-[#B71C1C] px-6 pt-10 pb-6">
        <button onClick={() => step > 1 ? setStep(step - 1) : onNavigate('login')} className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mb-4">
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1.5 rounded-full flex-1 transition-all ${s <= step ? 'bg-white' : 'bg-white/30'}`}></div>
          ))}
        </div>
        <h1 className="text-white" style={{ fontSize: '20px', fontWeight: 700 }}>إنشاء حساب</h1>
        <p className="text-red-200" style={{ fontSize: '13px' }}>الخطوة {step} من 3</p>
      </div>

      <div className="flex-1 px-5 pt-6 overflow-y-auto pb-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-[#1E293B] mb-4" style={{ fontSize: '16px', fontWeight: 700 }}>المعلومات الشخصية</h2>
            <div>
              <label className="block text-[#374151] mb-1.5" style={{ fontSize: '13px', fontWeight: 600 }}>الاسم الكامل</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="اسمك الكامل"
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#C62828] shadow-sm" style={{ fontSize: '13px' }} />
            </div>
            <div>
              <label className="block text-[#374151] mb-1.5" style={{ fontSize: '13px', fontWeight: 600 }}>رقم الهاتف</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+966 5X XXX XXXX"
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#C62828] shadow-sm" style={{ fontSize: '13px' }} dir="ltr" />
            </div>
            <div>
              <label className="block text-[#374151] mb-1.5" style={{ fontSize: '13px', fontWeight: 600 }}>العمر</label>
              <input type="number" value={form.age} onChange={e => setForm({...form, age: e.target.value})} placeholder="18-65 سنة"
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#C62828] shadow-sm" style={{ fontSize: '13px' }} />
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-[#1E293B] mb-4" style={{ fontSize: '16px', fontWeight: 700 }}>المعلومات الطبية</h2>
            <div>
              <label className="block text-[#374151] mb-2" style={{ fontSize: '13px', fontWeight: 600 }}>فصيلة الدم</label>
              <div className="grid grid-cols-4 gap-2">
                {bloodTypes.map(bt => (
                  <button key={bt} onClick={() => setForm({...form, bloodType: bt})}
                    className={`py-3 rounded-2xl transition-all ${form.bloodType === bt ? 'bg-[#C62828] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-red-200'}`}
                    style={{ fontSize: '14px', fontWeight: 700 }}>
                    {bt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[#374151] mb-1.5" style={{ fontSize: '13px', fontWeight: 600 }}>المدينة</label>
              <select value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#C62828]" style={{ fontSize: '13px' }}>
                {['الرياض', 'جدة', 'مكة', 'الدمام', 'المدينة', 'الطائف', 'أبها'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-[#1E293B] mb-4" style={{ fontSize: '16px', fontWeight: 700 }}>بيانات الدخول</h2>
            <div>
              <label className="block text-[#374151] mb-1.5" style={{ fontSize: '13px', fontWeight: 600 }}>البريد الإلكتروني</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="example@email.com"
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#C62828] shadow-sm" style={{ fontSize: '13px' }} dir="ltr" />
            </div>
            <div>
              <label className="block text-[#374151] mb-1.5" style={{ fontSize: '13px', fontWeight: 600 }}>كلمة المرور</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="8 أحرف على الأقل"
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#C62828] shadow-sm" style={{ fontSize: '13px' }} dir="ltr" />
            </div>
          </div>
        )}

        <button
          onClick={() => step < 3 ? setStep(step + 1) : onNavigate('home')}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C62828] to-[#B71C1C] text-white shadow-lg mt-6"
          style={{ fontSize: '15px', fontWeight: 700 }}>
          {step < 3 ? 'التالي ←' : 'إنشاء الحساب'}
        </button>
      </div>
    </div>
  );
}

function HomeScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[#F8F9FC]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#C62828] to-[#B71C1C] px-5 pt-10 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white blur-3xl"></div>
        </div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-red-200" style={{ fontSize: '13px' }}>مرحباً،</p>
              <h1 className="text-white" style={{ fontSize: '20px', fontWeight: 700 }}>عبدالله الأحمدي 👋</h1>
            </div>
            <button onClick={() => onNavigate('notifications')} className="relative w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -left-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900" style={{ fontSize: '10px', fontWeight: 700 }}>3</span>
            </button>
          </div>

          {/* Blood info card */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-[#C62828]" style={{ fontSize: '18px', fontWeight: 800 }}>O+</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white" style={{ fontSize: '14px', fontWeight: 700 }}>آخر تبرع: 15 أبريل</span>
                <span className="bg-green-400/30 text-green-200 px-2 py-0.5 rounded-full" style={{ fontSize: '11px' }}>مؤهل الآن</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-red-200" /><span className="text-red-200" style={{ fontSize: '12px' }}>8 تبرعات</span></div>
                <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-300" /><span className="text-yellow-200" style={{ fontSize: '12px' }}>800 نقطة</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-5 pb-24">
        {/* Main Action */}
        <button onClick={() => onNavigate('book')}
          className="w-full bg-gradient-to-r from-[#C62828] to-[#B71C1C] rounded-2xl p-5 flex items-center justify-between shadow-lg hover:shadow-xl transition-all">
          <div className="text-start">
            <div className="text-white mb-1" style={{ fontSize: '16px', fontWeight: 700 }}>احجز موعد تبرع</div>
            <div className="text-red-200" style={{ fontSize: '12px' }}>ساعد في إنقاذ حياة اليوم</div>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
        </button>

        {/* Quick Actions */}
        <div>
          <h2 className="text-[#1E293B] mb-3" style={{ fontSize: '15px', fontWeight: 700 }}>الخدمات السريعة</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'بنوك الدم', icon: MapPin, screen: 'map' as Screen, color: 'bg-blue-50', iconColor: 'text-blue-600' },
              { label: 'طلب طارئ', icon: AlertTriangle, screen: 'emergency' as Screen, color: 'bg-red-50', iconColor: 'text-red-600' },
              { label: 'المتصدرون', icon: Trophy, screen: 'leaderboard' as Screen, color: 'bg-yellow-50', iconColor: 'text-yellow-600' },
              { label: 'اختبار الأهلية', icon: Shield, screen: 'eligibility' as Screen, color: 'bg-green-50', iconColor: 'text-green-600' },
            ].map((action, i) => (
              <button key={i} onClick={() => onNavigate(action.screen)}
                className={`${action.color} rounded-2xl p-4 flex items-center gap-3 border border-transparent hover:shadow-md transition-all`}>
                <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm`}>
                  <action.icon className={`w-5 h-5 ${action.iconColor}`} />
                </div>
                <span className="text-[#1E293B]" style={{ fontSize: '13px', fontWeight: 600 }}>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Emergency Banner */}
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <div className="text-red-700" style={{ fontSize: '13px', fontWeight: 700 }}>🚨 طلب عاجل - فصيلة O-</div>
            <div className="text-red-500" style={{ fontSize: '12px' }}>مستشفى الملك فيصل يحتاج تبرعك الآن</div>
          </div>
          <button onClick={() => onNavigate('emergency')} className="bg-red-500 text-white px-3 py-1.5 rounded-xl" style={{ fontSize: '12px', fontWeight: 600 }}>
            استجب
          </button>
        </div>

        {/* Impact Stats */}
        <div>
          <h2 className="text-[#1E293B] mb-3" style={{ fontSize: '15px', fontWeight: 700 }}>أثرك الإيجابي</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: '24', label: 'حياة أنقذتها', icon: '❤️' },
              { value: '8', label: 'مرات تبرعت', icon: '🩸' },
              { value: '#12', label: 'مرتبتك', icon: '🏆' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
                <div className="text-xl mb-1">{stat.icon}</div>
                <div className="text-[#1E293B]" style={{ fontSize: '18px', fontWeight: 800 }}>{stat.value}</div>
                <div className="text-gray-400" style={{ fontSize: '11px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BookScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('تبرع كامل');
  const [location, setLocation] = useState('');

  const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30'];

  return (
    <div className="flex flex-col h-full bg-[#F8F9FC]">
      <div className="bg-gradient-to-r from-[#C62828] to-[#B71C1C] px-5 pt-10 pb-6">
        <button onClick={() => onNavigate('home')} className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mb-4">
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <h1 className="text-white" style={{ fontSize: '20px', fontWeight: 700 }}>حجز موعد</h1>
        <p className="text-red-200" style={{ fontSize: '13px' }}>اختر الوقت والمكان المناسب لك</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-24 space-y-5">
        {/* Eligibility Check */}
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <div className="text-green-700" style={{ fontSize: '13px', fontWeight: 700 }}>أنت مؤهل للتبرع ✓</div>
            <div className="text-green-500" style={{ fontSize: '12px' }}>مرت 56 يوماً على آخر تبرع</div>
          </div>
          <button onClick={() => onNavigate('eligibility')} className="mr-auto text-green-600 underline" style={{ fontSize: '11px' }}>
            تفاصيل
          </button>
        </div>

        {/* Donation Type */}
        <div>
          <label className="block text-[#374151] mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>نوع التبرع</label>
          <div className="grid grid-cols-3 gap-2">
            {['تبرع كامل', 'بلازما', 'صفائح دموية'].map(t => (
              <button key={t} onClick={() => setType(t)}
                className={`py-3 px-2 rounded-2xl text-center transition-all ${type === t ? 'bg-[#C62828] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600'}`}
                style={{ fontSize: '12px', fontWeight: 600 }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-[#374151] mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>التاريخ</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#C62828] shadow-sm" style={{ fontSize: '14px' }} />
        </div>

        {/* Time Slots */}
        <div>
          <label className="block text-[#374151] mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>الوقت المتاح</label>
          <div className="grid grid-cols-4 gap-2">
            {timeSlots.map(t => (
              <button key={t} onClick={() => setTime(t)}
                className={`py-2.5 rounded-xl text-center transition-all ${time === t ? 'bg-[#C62828] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-red-200'}`}
                style={{ fontSize: '13px', fontWeight: 600 }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-[#374151] mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>بنك الدم</label>
          <select value={location} onChange={e => setLocation(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#C62828] shadow-sm" style={{ fontSize: '14px' }}>
            <option value="">اختر بنك الدم</option>
            <option>بنك الدم المركزي - الرياض</option>
            <option>مستشفى الملك فهد - الرياض</option>
            <option>المركز الصحي المركزي - الرياض</option>
            <option>مستشفى المانع - الرياض</option>
          </select>
        </div>

        <button
          onClick={() => onNavigate('bookSuccess')}
          disabled={!date || !time || !location}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C62828] to-[#B71C1C] text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontSize: '15px', fontWeight: 700 }}>
          تأكيد الحجز
        </button>
      </div>
    </div>
  );
}

function BookSuccessScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="flex flex-col h-full bg-[#F8F9FC] items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
        <CheckCircle2 className="w-12 h-12 text-green-600" />
      </div>
      <h1 className="text-[#1E293B] mb-2" style={{ fontSize: '22px', fontWeight: 800 }}>تم الحجز بنجاح! 🎉</h1>
      <p className="text-gray-500 mb-6" style={{ fontSize: '14px', lineHeight: '1.8' }}>
        تم تأكيد موعدك في بنك الدم المركزي
        <br />السبت، 26 أبريل 2025 الساعة 10:00 ص
      </p>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm w-full mb-6">
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'النوع', value: 'تبرع كامل' },
            { label: 'الفصيلة', value: 'O+' },
            { label: 'المكان', value: 'بنك الدم المركزي' },
            { label: 'الطبيب', value: 'د. أحمد السعيد' },
          ].map((item, i) => (
            <div key={i} className="text-center p-2 bg-gray-50 rounded-xl">
              <div className="text-gray-400 mb-1" style={{ fontSize: '11px' }}>{item.label}</div>
              <div className="text-[#1E293B]" style={{ fontSize: '13px', fontWeight: 600 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 w-full mb-6 text-start">
        <div className="text-yellow-700 mb-1" style={{ fontSize: '13px', fontWeight: 700 }}>⚠️ تعليمات قبل التبرع:</div>
        <ul className="space-y-1">
          {['شرب الماء بكثرة قبل الموعد', 'تناول وجبة خفيفة', 'إحضار بطاقة الهوية', 'النوم الكافي ليلة السبق'].map((t, i) => (
            <li key={i} className="text-yellow-600 flex items-center gap-1.5" style={{ fontSize: '12px' }}>
              <span>•</span>{t}
            </li>
          ))}
        </ul>
      </div>

      <button onClick={() => onNavigate('home')} className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C62828] to-[#B71C1C] text-white shadow-lg" style={{ fontSize: '15px', fontWeight: 700 }}>
        العودة للرئيسية
      </button>
    </div>
  );
}

function EligibilityScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});

  const questions = [
    { q: 'هل عمرك بين 18 و65 سنة؟', key: 0, goodAnswer: true },
    { q: 'هل وزنك أكثر من 50 كيلوغرام؟', key: 1, goodAnswer: true },
    { q: 'هل أنت بصحة جيدة ولا تعاني من أمراض مزمنة؟', key: 2, goodAnswer: true },
    { q: 'هل مرت أكثر من 56 يوماً على آخر تبرع؟', key: 3, goodAnswer: true },
    { q: 'هل أنت في حالة حمل أو رضاعة؟', key: 4, goodAnswer: false },
    { q: 'هل تناولت مضادات حيوية خلال الأسبوعين الماضيين؟', key: 5, goodAnswer: false },
    { q: 'هل تعاني من ضغط الدم المرتفع غير المسيطر عليه؟', key: 6, goodAnswer: false },
  ];

  if (step >= questions.length) {
    const failedCount = questions.filter(q => answers[q.key] !== q.goodAnswer).length;
    const eligible = failedCount === 0;
    return (
      <div className="flex flex-col h-full bg-[#F8F9FC]">
        <div className={`px-5 pt-10 pb-6 ${eligible ? 'bg-gradient-to-r from-[#388E3C] to-[#2E7D32]' : 'bg-gradient-to-r from-[#C62828] to-[#B71C1C]'}`}>
          <h1 className="text-white" style={{ fontSize: '20px', fontWeight: 700 }}>نتيجة الاختبار</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-5 pb-24">
          <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-5 ${eligible ? 'bg-green-100' : 'bg-red-100'}`}>
            {eligible ? <CheckCircle2 className="w-12 h-12 text-green-600" /> : <X className="w-12 h-12 text-red-600" />}
          </div>
          <h2 className={`mb-2 ${eligible ? 'text-green-700' : 'text-red-700'}`} style={{ fontSize: '22px', fontWeight: 800 }}>
            {eligible ? 'أنت مؤهل للتبرع! ✓' : 'غير مؤهل حالياً'}
          </h2>
          <p className="text-gray-500 text-center mb-6" style={{ fontSize: '14px' }}>
            {eligible ? 'يمكنك حجز موعد التبرع الآن' : 'يرجى مراجعة طبيبك قبل التبرع'}
          </p>
          <button onClick={() => eligible ? onNavigate('book') : onNavigate('home')}
            className={`w-full py-4 rounded-2xl text-white shadow-lg ${eligible ? 'bg-gradient-to-r from-[#388E3C] to-[#2E7D32]' : 'bg-gradient-to-r from-[#C62828] to-[#B71C1C]'}`}
            style={{ fontSize: '15px', fontWeight: 700 }}>
            {eligible ? 'احجز موعد الآن' : 'العودة للرئيسية'}
          </button>
        </div>
      </div>
    );
  }

  const q = questions[step];
  return (
    <div className="flex flex-col h-full bg-[#F8F9FC]">
      <div className="bg-gradient-to-r from-[#1E293B] to-[#334155] px-5 pt-10 pb-6">
        <button onClick={() => step > 0 ? setStep(step - 1) : onNavigate('home')} className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center mb-4">
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div className="flex gap-1.5 mb-4">
          {questions.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full flex-1 transition-all ${i <= step ? 'bg-white' : 'bg-white/20'}`}></div>
          ))}
        </div>
        <p className="text-gray-400" style={{ fontSize: '12px' }}>السؤال {step + 1} من {questions.length}</p>
        <h1 className="text-white mt-1" style={{ fontSize: '16px', fontWeight: 700 }}>اختبار الأهلية للتبرع</h1>
      </div>
      <div className="flex-1 flex flex-col px-5 pt-8 pb-24">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-[#1E293B] text-center mb-8" style={{ fontSize: '18px', fontWeight: 700, lineHeight: '1.5' }}>{q.q}</h2>
          <div className="flex gap-4 w-full">
            <button
              onClick={() => { setAnswers({...answers, [q.key]: true}); setStep(step + 1); }}
              className="flex-1 py-4 rounded-2xl bg-green-50 border-2 border-green-200 text-green-700 hover:bg-green-100 transition-all"
              style={{ fontSize: '16px', fontWeight: 700 }}>✓ نعم</button>
            <button
              onClick={() => { setAnswers({...answers, [q.key]: false}); setStep(step + 1); }}
              className="flex-1 py-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 hover:bg-red-100 transition-all"
              style={{ fontSize: '16px', fontWeight: 700 }}>✗ لا</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="flex flex-col h-full bg-[#F8F9FC]">
      <div className="bg-gradient-to-r from-[#C62828] to-[#B71C1C] px-5 pt-10 pb-6">
        <h1 className="text-white" style={{ fontSize: '20px', fontWeight: 700 }}>سجل التبرعات</h1>
        <p className="text-red-200" style={{ fontSize: '13px' }}>تاريخ تبرعاتك الكريمة</p>
      </div>
      <div className="px-5 pt-5 pb-3">
        <div className="grid grid-cols-3 gap-3">
          {[
            { v: '8', l: 'تبرعات', icon: '🩸' },
            { v: '800', l: 'نقطة', icon: '⭐' },
            { v: '24', l: 'حياة', icon: '❤️' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
              <div className="text-lg mb-1">{s.icon}</div>
              <div className="text-[#1E293B]" style={{ fontSize: '20px', fontWeight: 800 }}>{s.v}</div>
              <div className="text-gray-400" style={{ fontSize: '11px' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-24 space-y-3 pt-3">
        {donorHistory.map(h => (
          <div key={h.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-stretch">
              <div className={`w-1.5 ${h.status === 'safe' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-[#1E293B]" style={{ fontSize: '14px', fontWeight: 700 }}>{h.type}</div>
                    <div className="text-gray-400" style={{ fontSize: '12px' }}>{h.location}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full ${h.status === 'safe' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} style={{ fontSize: '11px', fontWeight: 600 }}>
                    {h.status === 'safe' ? 'آمن ✓' : 'غير آمن'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-gray-500">
                  <span style={{ fontSize: '12px' }}>{h.date}</span>
                  <span style={{ fontSize: '12px' }}>{h.units} مل</span>
                  <span className="text-yellow-600 flex items-center gap-1" style={{ fontSize: '12px', fontWeight: 600 }}>
                    <Star className="w-3 h-3" />+{h.points}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="flex flex-col h-full bg-[#F8F9FC] overflow-y-auto pb-24">
      <div className="bg-gradient-to-br from-[#C62828] to-[#B71C1C] px-5 pt-10 pb-8 text-center relative">
        <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-lg border-2 border-white/30">
          <span className="text-white" style={{ fontSize: '28px', fontWeight: 800 }}>ع</span>
        </div>
        <h1 className="text-white" style={{ fontSize: '20px', fontWeight: 700 }}>عبدالله أحمد الأحمدي</h1>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="bg-white/20 text-white px-3 py-1 rounded-full" style={{ fontSize: '13px', fontWeight: 600 }}>O+</span>
          <span className="bg-white/20 text-white px-3 py-1 rounded-full" style={{ fontSize: '13px' }}>الرياض</span>
        </div>
        <div className="flex justify-center gap-6 mt-4">
          {[{ v: '8', l: 'تبرعات' }, { v: '800', l: 'نقطة' }, { v: '#12', l: 'المرتبة' }].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-white" style={{ fontSize: '20px', fontWeight: 800 }}>{s.v}</div>
              <div className="text-red-200" style={{ fontSize: '11px' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="px-5 pt-5">
        <h2 className="text-[#1E293B] mb-3" style={{ fontSize: '15px', fontWeight: 700 }}>الإنجازات والشارات</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[
            { icon: '🩸', label: 'مانح الدم', color: 'bg-red-50 border-red-100' },
            { icon: '⭐', label: 'مانح فضي', color: 'bg-gray-50 border-gray-200' },
            { icon: '🏆', label: 'متصدر', color: 'bg-yellow-50 border-yellow-100' },
            { icon: '❤️', label: 'منقذ حياة', color: 'bg-pink-50 border-pink-100' },
            { icon: '🔥', label: '5 تبرعات', color: 'bg-orange-50 border-orange-100' },
          ].map((b, i) => (
            <div key={i} className={`flex-shrink-0 ${b.color} border rounded-2xl p-3 text-center w-20`}>
              <div className="text-2xl mb-1">{b.icon}</div>
              <div className="text-gray-600" style={{ fontSize: '10px', fontWeight: 600 }}>{b.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-5 pt-4 space-y-2">
        <h2 className="text-[#1E293B] mb-3" style={{ fontSize: '15px', fontWeight: 700 }}>معلومات الحساب</h2>
        {[
          { icon: User, label: 'الاسم', value: 'عبدالله أحمد الأحمدي' },
          { icon: Phone, label: 'الهاتف', value: '+966 50 111 2222' },
          { icon: MapPin, label: 'المدينة', value: 'الرياض' },
          { icon: Heart, label: 'فصيلة الدم', value: 'O+' },
          { icon: Calendar, label: 'تاريخ الميلاد', value: '15 مارس 1997' },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-gray-100 shadow-sm">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <item.icon className="w-5 h-5 text-[#C62828]" />
            </div>
            <div className="flex-1">
              <div className="text-gray-400" style={{ fontSize: '11px' }}>{item.label}</div>
              <div className="text-[#1E293B]" style={{ fontSize: '14px', fontWeight: 600 }}>{item.value}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </div>
        ))}
        <button onClick={() => onNavigate('login')} className="w-full py-4 mt-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center gap-2" style={{ fontSize: '14px', fontWeight: 600 }}>
          <LogIn className="w-4 h-4" />تسجيل الخروج
        </button>
      </div>
    </div>
  );
}

function LeaderboardScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [city, setCity] = useState('all');

  return (
    <div className="flex flex-col h-full bg-[#F8F9FC]">
      <div className="bg-gradient-to-r from-[#F57C00] to-[#E65100] px-5 pt-10 pb-6">
        <h1 className="text-white" style={{ fontSize: '20px', fontWeight: 700 }}>لوحة المتصدرين 🏆</h1>
        <p className="text-orange-200" style={{ fontSize: '13px' }}>أبطال التبرع بالدم</p>
      </div>

      {/* Filters */}
      <div className="px-5 py-3 bg-white border-b border-gray-100 flex gap-3 sticky top-0 z-10">
        <div className="flex bg-gray-100 rounded-xl overflow-hidden flex-1">
          {(['monthly', 'yearly'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`flex-1 py-2 text-xs font-semibold transition-all ${period === p ? 'bg-[#F57C00] text-white' : 'text-gray-500'}`}>
              {p === 'monthly' ? 'شهري' : 'سنوي'}
            </button>
          ))}
        </div>
        <select value={city} onChange={e => setCity(e.target.value)} className="bg-gray-100 rounded-xl px-3 py-2 focus:outline-none text-gray-600" style={{ fontSize: '12px' }}>
          <option value="all">جميع المدن</option>
          {['الرياض', 'جدة', 'الدمام', 'مكة'].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Top 3 podium */}
      <div className="bg-gradient-to-b from-orange-50 to-white px-5 py-5">
        <div className="flex items-end justify-center gap-3 h-32">
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map((leader, i) => {
            const rank = i === 1 ? 1 : i === 0 ? 2 : 3;
            const heights = { 0: 'h-24', 1: 'h-32', 2: 'h-20' };
            const colors = { 0: 'bg-gray-300', 1: 'bg-yellow-400', 2: 'bg-orange-400' };
            return (
              <div key={leader.rank} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border-2 border-gray-200">
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B' }}>{leader.name[0]}</span>
                </div>
                <div className="text-center" style={{ fontSize: '10px', fontWeight: 600, color: '#374151' }}>{leader.name.split(' ')[0]}</div>
                <div className={`${heights[i as keyof typeof heights]} ${colors[i as keyof typeof colors]} rounded-t-2xl w-16 flex items-center justify-center`}>
                  <span className="text-white" style={{ fontSize: '18px', fontWeight: 800 }}>#{rank}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full List */}
      <div className="flex-1 overflow-y-auto px-5 pb-24 space-y-2">
        {leaderboard.map((leader) => (
          <div key={leader.rank} className={`bg-white rounded-2xl p-4 flex items-center gap-3 border shadow-sm ${leader.rank <= 3 ? 'border-yellow-100' : 'border-gray-100'}`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${leader.rank === 1 ? 'bg-yellow-100' : leader.rank === 2 ? 'bg-gray-100' : leader.rank === 3 ? 'bg-orange-100' : 'bg-gray-50'}`}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: leader.rank === 1 ? '#F59E0B' : leader.rank === 2 ? '#6B7280' : leader.rank === 3 ? '#F97316' : '#9CA3AF' }}>#{leader.rank}</span>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-[#C62828]" style={{ fontSize: '14px', fontWeight: 800 }}>{leader.name[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[#1E293B]" style={{ fontSize: '14px', fontWeight: 600 }}>{leader.name}</div>
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="w-3 h-3" />
                <span style={{ fontSize: '11px' }}>{leader.city}</span>
                <span className="text-[#C62828]" style={{ fontSize: '11px' }}>{leader.bloodType}</span>
              </div>
            </div>
            <div className="text-end">
              <div className="text-[#1E293B]" style={{ fontSize: '15px', fontWeight: 700 }}>{leader.donations}</div>
              <div className="text-gray-400" style={{ fontSize: '11px' }}>تبرع</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationsScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [notifs, setNotifs] = useState(notifications);

  const typeIcons: Record<string, string> = {
    reminder: '⏰', reward: '🏆', emergency: '🚨', appointment: '📅', system: '⚙️', campaign: '📢',
  };
  const typeColors: Record<string, string> = {
    reminder: 'bg-blue-50 border-blue-100',
    reward: 'bg-yellow-50 border-yellow-100',
    emergency: 'bg-red-50 border-red-100',
    appointment: 'bg-green-50 border-green-100',
    system: 'bg-gray-50 border-gray-100',
    campaign: 'bg-purple-50 border-purple-100',
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F9FC]">
      <div className="bg-gradient-to-r from-[#1E293B] to-[#334155] px-5 pt-10 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-white" style={{ fontSize: '20px', fontWeight: 700 }}>الإشعارات</h1>
          <p className="text-gray-400" style={{ fontSize: '13px' }}>{notifs.filter(n => !n.read).length} إشعارات جديدة</p>
        </div>
        <button onClick={() => setNotifs(n => n.map(notif => ({...notif, read: true})))} className="bg-white/10 px-3 py-1.5 rounded-xl text-white" style={{ fontSize: '12px' }}>
          قراءة الكل
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-24 space-y-3">
        {notifs.map(notif => (
          <div key={notif.id} onClick={() => setNotifs(n => n.map(nn => nn.id === notif.id ? {...nn, read: true} : nn))}
            className={`rounded-2xl p-4 border cursor-pointer transition-all ${typeColors[notif.type]} ${!notif.read ? 'shadow-md' : 'opacity-70'}`}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 text-xl shadow-sm">
                {typeIcons[notif.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-[#1E293B]" style={{ fontSize: '14px', fontWeight: 600 }}>{notif.title}</div>
                  {!notif.read && <div className="w-2 h-2 bg-[#C62828] rounded-full flex-shrink-0 mt-1"></div>}
                </div>
                <div className="text-gray-500 mt-0.5" style={{ fontSize: '12px', lineHeight: '1.6' }}>{notif.message}</div>
                <div className="text-gray-400 mt-1.5" style={{ fontSize: '11px' }}>{notif.time}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmergencyScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ bloodType: 'O-', units: 3, hospital: '', urgency: 'critical', reason: '' });

  if (submitted) {
    return (
      <div className="flex flex-col h-full bg-[#F8F9FC] items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-red-600" />
        </div>
        <h1 className="text-[#1E293B] mb-2" style={{ fontSize: '22px', fontWeight: 800 }}>تم إرسال الطلب! 🚨</h1>
        <p className="text-gray-500 mb-6" style={{ fontSize: '14px' }}>تم إرسال طلب التبرع الطارئ وستصل إشعارات للمتبرعين المؤهلين في منطقتك</p>
        <button onClick={() => onNavigate('home')} className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C62828] to-[#B71C1C] text-white shadow-lg" style={{ fontSize: '15px', fontWeight: 700 }}>
          العودة للرئيسية
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F8F9FC]">
      <div className="bg-gradient-to-r from-[#C62828] to-[#B71C1C] px-5 pt-10 pb-6">
        <button onClick={() => onNavigate('home')} className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mb-4">
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div className="flex items-center gap-2 bg-white/20 rounded-2xl px-3 py-2 mb-3 w-fit">
          <AlertTriangle className="w-4 h-4 text-yellow-300" />
          <span className="text-yellow-200" style={{ fontSize: '13px', fontWeight: 600 }}>طلب طوارئ</span>
        </div>
        <h1 className="text-white" style={{ fontSize: '20px', fontWeight: 700 }}>طلب دم عاجل</h1>
        <p className="text-red-200" style={{ fontSize: '13px' }}>سيصل الطلب للمتبرعين المؤهلين فوراً</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-24 space-y-4">
        <div>
          <label className="block text-[#374151] mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>الفصيلة المطلوبة</label>
          <div className="grid grid-cols-4 gap-2">
            {bloodTypes.map(bt => (
              <button key={bt} onClick={() => setFormData({...formData, bloodType: bt})}
                className={`py-3 rounded-2xl transition-all ${formData.bloodType === bt ? 'bg-[#C62828] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600'}`}
                style={{ fontSize: '13px', fontWeight: 700 }}>{bt}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[#374151] mb-1.5" style={{ fontSize: '14px', fontWeight: 600 }}>عدد الوحدات المطلوبة</label>
          <div className="flex gap-2">
            {[1, 2, 3, 5, 10].map(n => (
              <button key={n} onClick={() => setFormData({...formData, units: n})}
                className={`w-12 h-12 rounded-2xl transition-all ${formData.units === n ? 'bg-[#C62828] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600'}`}
                style={{ fontSize: '14px', fontWeight: 700 }}>{n}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[#374151] mb-1.5" style={{ fontSize: '14px', fontWeight: 600 }}>المستشفى</label>
          <input value={formData.hospital} onChange={e => setFormData({...formData, hospital: e.target.value})} placeholder="اسم المستشفى"
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#C62828] shadow-sm" style={{ fontSize: '14px' }} />
        </div>

        <div>
          <label className="block text-[#374151] mb-1.5" style={{ fontSize: '14px', fontWeight: 600 }}>سبب الطلب</label>
          <textarea rows={3} value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} placeholder="اشرح سبب الطلب الطارئ..."
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#C62828] resize-none shadow-sm" style={{ fontSize: '14px' }} />
        </div>

        <button
          onClick={() => setSubmitted(true)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C62828] to-[#B71C1C] text-white shadow-lg flex items-center justify-center gap-2"
          style={{ fontSize: '15px', fontWeight: 700 }}>
          <AlertTriangle className="w-5 h-5" />إرسال طلب الطوارئ
        </button>
      </div>
    </div>
  );
}

function MapScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const banks = [
    { name: 'بنك الدم المركزي', address: 'شارع الملك فهد، الرياض', distance: '1.2 كم', open: true, types: ['O+', 'A+', 'B+'] },
    { name: 'مستشفى الملك فهد', address: 'شارع التحلية، الرياض', distance: '2.8 كم', open: true, types: ['O-', 'AB+'] },
    { name: 'المركز الصحي المركزي', address: 'حي النزهة، الرياض', distance: '4.5 كم', open: false, types: ['A-', 'B-'] },
    { name: 'مستشفى الحرس الوطني', address: 'شارع الملك عبدالعزيز', distance: '6.1 كم', open: true, types: ['O+', 'AB-'] },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F8F9FC]">
      <div className="bg-gradient-to-r from-[#1565C0] to-[#1976D2] px-5 pt-10 pb-6">
        <button onClick={() => onNavigate('home')} className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mb-4">
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <h1 className="text-white" style={{ fontSize: '20px', fontWeight: 700 }}>بنوك الدم القريبة</h1>
        <p className="text-blue-200" style={{ fontSize: '13px' }}>الرياض - حيك الحالي</p>
      </div>

      {/* Map Placeholder */}
      <div className="mx-5 mt-4 bg-blue-50 rounded-2xl overflow-hidden border border-blue-100 shadow-sm" style={{ height: '160px' }}>
        <div className="w-full h-full flex items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 opacity-50"></div>
          <div className="relative text-center">
            <MapPin className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-blue-600" style={{ fontSize: '13px', fontWeight: 600 }}>خريطة تفاعلية</p>
            <p className="text-blue-400" style={{ fontSize: '11px' }}>4 بنوك دم في محيط 10 كم</p>
          </div>
          {/* Map dots */}
          {[
            { top: '30%', left: '40%' }, { top: '55%', left: '65%' },
            { top: '25%', left: '70%' }, { top: '70%', left: '30%' },
          ].map((pos, i) => (
            <div key={i} className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-md animate-pulse" style={{ top: pos.top, left: pos.left }}></div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-24 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-[#1E293B]" style={{ fontSize: '15px', fontWeight: 700 }}>بنوك الدم القريبة</h2>
          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full" style={{ fontSize: '11px' }}>{banks.length}</span>
        </div>
        {banks.map((bank, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Droplets className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-[#1E293B]" style={{ fontSize: '14px', fontWeight: 700 }}>{bank.name}</div>
                  <span className={`px-2 py-0.5 rounded-full ${bank.open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`} style={{ fontSize: '11px', fontWeight: 600 }}>
                    {bank.open ? 'مفتوح' : 'مغلق'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400 mb-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span style={{ fontSize: '12px' }}>{bank.address}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {bank.types.map(t => (
                      <span key={t} className="bg-red-50 text-[#C62828] px-2 py-0.5 rounded-lg" style={{ fontSize: '11px', fontWeight: 600 }}>{t}</span>
                    ))}
                  </div>
                  <span className="text-blue-600 flex items-center gap-1" style={{ fontSize: '12px', fontWeight: 600 }}>
                    <MapPin className="w-3 h-3" />{bank.distance}
                  </span>
                </div>
              </div>
            </div>
            <button className="w-full mt-3 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors">
              احجز في هذا البنك
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Phone frame wrapper
export default function MobileApp() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>('login');

  const renderScreen = () => {
    switch (screen) {
      case 'login': return <LoginScreen onNavigate={setScreen} />;
      case 'register': return <RegisterScreen onNavigate={setScreen} />;
      case 'home': return <HomeScreen onNavigate={setScreen} />;
      case 'book': return <BookScreen onNavigate={setScreen} />;
      case 'bookSuccess': return <BookSuccessScreen onNavigate={setScreen} />;
      case 'eligibility': return <EligibilityScreen onNavigate={setScreen} />;
      case 'history': return <HistoryScreen onNavigate={setScreen} />;
      case 'profile': return <ProfileScreen onNavigate={setScreen} />;
      case 'leaderboard': return <LeaderboardScreen onNavigate={setScreen} />;
      case 'notifications': return <NotificationsScreen onNavigate={setScreen} />;
      case 'emergency': return <EmergencyScreen onNavigate={setScreen} />;
      case 'map': return <MapScreen onNavigate={setScreen} />;
      default: return <HomeScreen onNavigate={setScreen} />;
    }
  };

  const showNav = !['login', 'register', 'eligibility', 'bookSuccess'].includes(screen);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E293B] via-[#2D3748] to-[#1E293B] flex items-center justify-center p-4" dir="rtl">
      {/* Back button */}
      <button onClick={() => navigate('/')} className="absolute top-6 right-6 flex items-center gap-2 text-white/60 hover:text-white transition-colors z-10">
        <ArrowLeft className="w-5 h-5" />
        <span style={{ fontSize: '14px' }}>العودة</span>
      </button>

      <div className="text-center mb-6 absolute top-6 left-1/2 -translate-x-1/2">
        <p className="text-white/50" style={{ fontSize: '13px' }}>تطبيق المتبرع - محاكاة شاشة الهاتف</p>
      </div>

      {/* Phone Frame */}
      <div className="relative">
        {/* Phone outer */}
        <div className="bg-[#0F0F0F] rounded-[50px] p-3 shadow-2xl" style={{ width: '380px' }}>
          {/* Status bar notch */}
          <div className="bg-black rounded-[44px] overflow-hidden relative" style={{ height: '780px' }}>
            {/* Status bar */}
            <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-6 py-3 bg-transparent">
              <span className="text-white/80" style={{ fontSize: '12px', fontWeight: 600 }}>9:41</span>
              <div className="w-28 h-7 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-0"></div>
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5">
                  {[3, 4, 5].map(h => <div key={h} className="bg-white/80 rounded-sm" style={{ width: '3px', height: `${h}px` }}></div>)}
                </div>
                <div className="w-4 h-4 rounded border border-white/80 relative">
                  <div className="absolute inset-0.5 bg-white/80 rounded-sm" style={{ right: '40%' }}></div>
                </div>
              </div>
            </div>

            {/* Screen Content */}
            <div className="absolute inset-0 overflow-hidden" style={{ direction: 'rtl', fontFamily: 'Cairo' }}>
              {renderScreen()}
            </div>

            {/* Bottom Nav */}
            {showNav && (
              <div className="absolute bottom-0 inset-x-0 bg-white border-t border-gray-100 z-20 safe-area-bottom" style={{ paddingBottom: '16px' }}>
                <div className="flex items-center justify-around px-2 pt-2">
                  {navItems.map(item => {
                    const isActive = screen === item.id || (item.id === 'home' && screen === 'book') || (item.id === 'home' && screen === 'map') || (item.id === 'home' && screen === 'emergency');
                    return (
                      <button key={item.id} onClick={() => setScreen(item.id as Screen)} className="flex flex-col items-center gap-1 px-3 py-1">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${isActive ? 'bg-[#C62828]' : 'bg-transparent'}`}>
                          <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                        </div>
                        <span className={`${isActive ? 'text-[#C62828]' : 'text-gray-400'}`} style={{ fontSize: '10px', fontWeight: isActive ? 700 : 400 }}>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side button decorations */}
        <div className="absolute top-28 -right-2 w-1.5 h-12 bg-[#1A1A1A] rounded-full"></div>
        <div className="absolute top-48 -right-2 w-1.5 h-8 bg-[#1A1A1A] rounded-full"></div>
        <div className="absolute top-36 -left-2 w-1.5 h-16 bg-[#1A1A1A] rounded-full"></div>
      </div>

      {/* Screen Labels */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-wrap gap-2 justify-center max-w-xl px-4">
        {[
          { s: 'login', l: 'تسجيل دخول' }, { s: 'register', l: 'إنشاء حساب' },
          { s: 'home', l: 'الرئيسية' }, { s: 'book', l: 'حجز موعد' },
          { s: 'eligibility', l: 'اختبار الأهلية' }, { s: 'history', l: 'السجل' },
          { s: 'leaderboard', l: 'المتصدرون' }, { s: 'notifications', l: 'الإشعارات' },
          { s: 'emergency', l: 'طوارئ' }, { s: 'map', l: 'الخريطة' },
          { s: 'profile', l: 'الملف الشخصي' },
        ].map(item => (
          <button key={item.s} onClick={() => setScreen(item.s as Screen)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${screen === item.s ? 'bg-[#C62828] text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
            {item.l}
          </button>
        ))}
      </div>
    </div>
  );
}
