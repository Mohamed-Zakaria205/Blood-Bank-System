import {
  User,
  Phone,
  Activity,
  Building2,
  MapPin,
  CreditCard,
  Megaphone,
  ChevronLeft,
} from 'lucide-react';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { SimpleForm } from './donationFormSchema';
import { EGYPT_DATA } from '../../../data/egypt';
import type { Campaign } from '../../../types';
import type { DonationCenter } from '../../../types/donationCenter';

interface StepOneProps {
  form: SimpleForm;
  register: UseFormRegister<SimpleForm>;
  errors: FieldErrors<SimpleForm>;
  activeCampaigns: Campaign[];
  selectedCampaign: Campaign | undefined;
  donationCenters: DonationCenter[];
  selectedCenter: DonationCenter | undefined;
  updateField: <K extends keyof SimpleForm>(key: K, value: SimpleForm[K]) => void;
  onNext: () => void;
}

export default function StepOne({
  form,
  register,
  errors,
  activeCampaigns,
  selectedCampaign,
  donationCenters,
  selectedCenter,
  updateField,
  onNext,
}: StepOneProps) {
  const currentGovernorateObj = EGYPT_DATA.find((g) => g.name_ar === form.governorate);
  const currentCities = currentGovernorateObj?.cities || [];
  const currentDistrictObj = currentCities.find((c) => c.city_name_ar === form.district);
  const currentAreas = currentDistrictObj?.areas || [];

  return (
    <>
      {/* Source Selection */}
      <div>
        <label
          className="block text-gray-700 mb-2"
          style={{ fontSize: '13px', fontWeight: 600 }}
        >
          <Activity className="w-4 h-4 inline ml-1 text-green-600" />
          مصدر المتبرع
        </label>
        <div className="grid grid-cols-3 gap-3">
          {/* Walk-in */}
          <button
            type="button"
            onClick={() => updateField('source', 'walkin')}
            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${form.source === 'walkin' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-200'}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${form.source === 'walkin' ? 'bg-green-600' : 'bg-gray-100'}`}
            >
              <Building2
                className={`w-4 h-4 ${form.source === 'walkin' ? 'text-white' : 'text-gray-400'}`}
              />
            </div>
            <div className="text-right">
              <p
                className={form.source === 'walkin' ? 'text-green-700' : 'text-gray-700'}
                style={{ fontSize: '12px', fontWeight: 700 }}
              >
                داخل البنك
              </p>
              <p className="text-gray-400" style={{ fontSize: '10px' }}>
                Walk-in
              </p>
            </div>
          </button>

          {/* App */}

          {/* Campaign */}
          <button
            type="button"
            onClick={() => updateField('source', 'campaign')}
            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${form.source === 'campaign' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-200'}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${form.source === 'campaign' ? 'bg-purple-500' : 'bg-gray-100'}`}
            >
              <Megaphone
                className={`w-4 h-4 ${form.source === 'campaign' ? 'text-white' : 'text-gray-400'}`}
              />
            </div>
            <div className="text-right">
              <p
                className={form.source === 'campaign' ? 'text-purple-700' : 'text-gray-700'}
                style={{ fontSize: '12px', fontWeight: 700 }}
              >
                من حملة
              </p>
              <p className="text-gray-400" style={{ fontSize: '10px' }}>
                Campaign
              </p>
            </div>
          </button>
        </div>

        {/* Campaign Selector */}
        {form.source === 'campaign' && (
          <div className="mt-3">
            <select
              {...register('campaignId')}
              className={`w-full px-4 py-3 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all ${errors.campaignId ? 'border-red-300' : 'border-gray-200'}`}
              style={{ fontSize: '13px' }}
            >
              <option value="">— اختر الحملة —</option>
              {activeCampaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            {errors.campaignId?.message && (
              <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
                {errors.campaignId.message}
              </p>
            )}
            {selectedCampaign && (
              <div className="mt-2 p-2.5 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-between">
                <span
                  className="text-purple-700"
                  style={{ fontSize: '12px', fontWeight: 600 }}
                >
                  {selectedCampaign.title}
                </span>
                <span className="text-purple-500" style={{ fontSize: '11px' }}>
                  {selectedCampaign.registeredDonors} / {selectedCampaign.targetDonors}{' '}
                  متبرع
                </span>
              </div>
            )}
          </div>
        )}

        {/* Donation Center Selector — shown when source is walkin */}
        {form.source === 'walkin' && (
          <div className="mt-3">
            <select
              {...register('donationCenterId')}
              className={`w-full px-4 py-3 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all ${errors.donationCenterId ? 'border-red-300' : 'border-gray-200'}`}
              style={{ fontSize: '13px' }}
            >
              <option value="">— اختر مركز التبرع —</option>
              {donationCenters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.donationCenterId?.message && (
              <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
                {errors.donationCenterId.message}
              </p>
            )}
            {selectedCenter && (
              <div className="mt-2 p-2.5 bg-green-50 border border-green-100 rounded-xl flex items-center justify-between">
                <span className="text-green-700" style={{ fontSize: '12px', fontWeight: 600 }}>
                  {selectedCenter.name}
                </span>
                <span className="text-green-500" style={{ fontSize: '11px' }}>
                  {selectedCenter.location}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100" />

      {/* Full Name */}
      <div>
        <label
          className="block text-gray-700 mb-1.5"
          style={{ fontSize: '13px', fontWeight: 600 }}
        >
          <User className="w-4 h-4 inline ml-1 text-green-600" />
          الاسم الكامل *
        </label>
        <input
          {...register('name')}
          placeholder="مثال: أحمد محمد علي"
          className={`w-full px-4 py-3 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all ${errors.name ? 'border-red-300' : 'border-gray-200'}`}
          style={{ fontSize: '14px' }}
        />
        {errors.name?.message && (
          <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Gender + Age */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            className="block text-gray-700 mb-1.5"
            style={{ fontSize: '13px', fontWeight: 600 }}
          >
            الجنس *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              ['male', 'ذكر'],
              ['female', 'أنثى'],
            ].map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => updateField('gender', v)}
                className={`py-3 rounded-xl border-2 transition-all ${form.gender === v ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                style={{
                  fontSize: '13px',
                  fontWeight: form.gender === v ? 700 : 500,
                }}
              >
                {l}
              </button>
            ))}
          </div>
          {errors.gender?.message && (
            <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
              {errors.gender.message}
            </p>
          )}
        </div>
        <div>
          <label
            className="block text-gray-700 mb-1.5"
            style={{ fontSize: '13px', fontWeight: 600 }}
          >
            العمر * <span className="text-gray-400">(18-65)</span>
          </label>
          <input
            type="number"
            {...register('age')}
            placeholder="مثال: 28"
            min="18"
            max="65"
            className={`w-full px-4 py-3 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 ${errors.age ? 'border-red-300' : 'border-gray-200'}`}
            style={{ fontSize: '14px' }}
          />
          {errors.age?.message && (
            <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
              {errors.age.message}
            </p>
          )}
        </div>
      </div>

      {/* Phone + National ID */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            className="block text-gray-700 mb-1.5"
            style={{ fontSize: '13px', fontWeight: 600 }}
          >
            <Phone className="w-4 h-4 inline ml-1 text-green-600" />
            رقم الهاتف *
          </label>
          <input
            {...register('phone', {
              setValueAs: (value) =>
                typeof value === 'string' ? value.replace(/\D/g, '').slice(0, 11) : value,
            })}
            placeholder="01xxxxxxxxx"
            maxLength={11}
            inputMode="numeric"
            pattern="[0-9]*"
            className={`w-full px-4 py-3 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 ${errors.phone ? 'border-red-300' : 'border-gray-200'}`}
            style={{ fontSize: '14px' }}
            dir="ltr"
          />
          {errors.phone?.message && (
            <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
              {errors.phone.message}
            </p>
          )}
        </div>
        <div>
          <label
            className="block text-gray-700 mb-1.5"
            style={{ fontSize: '13px', fontWeight: 600 }}
          >
            <CreditCard className="w-4 h-4 inline ml-1 text-green-600" />
            رقم الهوية الوطنية *
          </label>
          <input
            {...register('nationalId', {
              setValueAs: (value) =>
                typeof value === 'string' ? value.replace(/\D/g, '').slice(0, 14) : value,
            })}
            placeholder="14 رقماً"
            maxLength={14}
            inputMode="numeric"
            pattern="[0-9]*"
            className={`w-full px-4 py-3 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 ${errors.nationalId ? 'border-red-300' : 'border-gray-200'}`}
            style={{ fontSize: '14px' }}
            dir="ltr"
          />
          {errors.nationalId?.message && (
            <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
              {errors.nationalId.message}
            </p>
          )}
        </div>
      </div>

      {/* Address → Governorate + District + Area */}
      <div>
        <label
          className="block text-gray-700 mb-2"
          style={{ fontSize: '13px', fontWeight: 600 }}
        >
          <MapPin className="w-4 h-4 inline ml-1 text-green-600" />
          العنوان التفصيلي
        </label>
        <div className="grid grid-cols-3 gap-3">
          {/* Governorate */}
          <div>
            <label
              className="block text-gray-500 mb-1.5"
              style={{ fontSize: '11px', fontWeight: 600 }}
            >
              المحافظة *
            </label>
            <select
              {...register('governorate', {
                onChange: () => {
                  updateField('district', '');
                  updateField('area', '');
                },
              })}
              className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
              style={{ fontSize: '13px' }}
            >
              <option value="">— اختر المحافظة —</option>
              {EGYPT_DATA.map((g) => (
                <option key={g.id} value={g.name_ar}>
                  {g.name_ar}
                </option>
              ))}
            </select>
          </div>
          {/* District */}
          <div>
            <label
              className="block text-gray-500 mb-1.5"
              style={{ fontSize: '11px', fontWeight: 600 }}
            >
              المركز *
            </label>
            <select
              {...register('district', {
                onChange: () => {
                  updateField('area', '');
                },
              })}
              className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
              style={{ fontSize: '13px' }}
            >
              <option value="">— اختر المركز —</option>
              {currentCities.map((d) => (
                <option key={d.id} value={d.city_name_ar}>
                  {d.city_name_ar}
                </option>
              ))}
            </select>
          </div>
          {/* Area */}
          <div>
            <label
              className="block text-gray-500 mb-1.5"
              style={{ fontSize: '11px', fontWeight: 600 }}
            >
              المنطقة / الشارع *
            </label>
            {currentAreas.length > 0 ? (
              <select
                {...register('area')}
                className={`w-full px-3 py-3 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all ${errors.area ? 'border-red-300' : 'border-gray-200'}`}
                style={{ fontSize: '13px' }}
              >
                <option value="">— اختر المنطقة —</option>
                {currentAreas.map((a) => (
                  <option key={a.id} value={a.name_ar}>
                    {a.name_ar}
                  </option>
                ))}
              </select>
            ) : (
              <input
                {...register('area')}
                placeholder="أدخل المنطقة / الشارع"
                className={`w-full px-3 py-3 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all ${errors.area ? 'border-red-300' : 'border-gray-200'}`}
                style={{ fontSize: '13px' }}
              />
            )}
            {errors.area?.message && (
              <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
                {errors.area.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Next button */}
      <div className="border-t border-gray-100 pt-2">
        <button
          type="button"
          onClick={onNext}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all shadow-sm"
          style={{ fontSize: '14px', fontWeight: 700 }}
        >
          التالي — البيانات الطبية
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
    </>
  );
}

