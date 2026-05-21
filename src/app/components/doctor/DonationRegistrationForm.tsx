import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Check, Smartphone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useSlot15Data } from '../../hooks/useAppointments';
import { useAddDonation, useAddMedicalRecord, useSearchDonor } from '../../hooks/useDonors';
import { toast } from 'sonner';
import { useForm, Path, PathValue } from 'react-hook-form';
import { Form } from '../ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { BloodType, DonationType, DonorStatus } from '../../types/common';
import type { Donor } from '../../types/donor';

// ── Sub-components ──
import { donorSchema, initialForm, type SimpleForm } from './donation-registration/donationFormSchema';
import StepOne from './donation-registration/StepOne';
import StepTwo from './donation-registration/StepTwo';

export default function DonationRegistrationForm() {
  const navigate = useNavigate();
  useAuth();
  const [searchParams] = useSearchParams();
  const { data: campaignsData = [] } = useCampaigns();
  const { data: slot15DataFromHook = [] } = useSlot15Data();
  const addDonation = useAddDonation();
  const addMedicalRecord = useAddMedicalRecord();
  const searchDonor = useSearchDonor();
  const [donationId, setDonationId] = useState<string | null>(null);
  const [searchId, setSearchId] = useState('');

  // Pre-fill from appointment if ?apt=S15-xxx
  const aptId = searchParams.get('apt');
  const appointment = aptId ? slot15DataFromHook.find((s) => s.id === aptId) ?? null : null;

  const getInitialForm = (): SimpleForm => {
    if (appointment) {
      return {
        ...initialForm,
        name: appointment.donorName || '',
        gender: appointment.donorGender || '',
        age: appointment.donorAge ? String(appointment.donorAge) : '',
        phone: appointment.donorPhone || '',
        nationalId: appointment.donorNationalId || '',
        district: appointment.donorDistrict || 'بني سويف',
        area: appointment.donorArea || '',
        bloodType: appointment.donorBloodType || '',
        donationType: appointment.donationType || 'whole',
        source: 'app',
        donationTime: appointment.time || new Date().toTimeString().slice(0, 5),
      };
    }
    return initialForm;
  };

  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const formMethods = useForm<SimpleForm>({
    defaultValues: getInitialForm(),
    mode: 'onTouched',
    resolver: zodResolver(donorSchema),
  });
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    getValues,
    formState: { errors },
  } = formMethods;
  const form = watch();

  useEffect(() => {
    reset(getInitialForm());
    setStep(1);
  }, [appointment?.id, reset]);

  useEffect(() => {
    register('source');
    register('gender');
    register('bloodType');
    register('donationType');
    register('status');
    register('diseases');
    register('isAllergic');
    register('governorate');
    register('donationTime');
  }, [register]);

  const activeCampaigns = campaignsData.filter((c) => c.status === 'active');

  const updateField = <K extends keyof SimpleForm>(key: K, value: SimpleForm[K]) => {
    setValue(key as Path<SimpleForm>, value as PathValue<SimpleForm, Path<SimpleForm>>, {
      shouldDirty: true,
      shouldValidate: true,
    });
    if (key === 'source' && value !== 'campaign') {
      setValue('campaignId', '', { shouldDirty: true, shouldValidate: true });
    }
  };

  const toggleDisease = (id: string) => {
    const current = getValues('diseases') || [];
    const next = current.includes(id) ? current.filter((d) => d !== id) : [...current, id];
    setValue('diseases', next, { shouldDirty: true, shouldValidate: true });
  };

  const handleSearch = () => {
    if (!searchId || searchId.length !== 14) {
      toast.error('يرجى إدخال رقم قومي صحيح (14 رقم)');
      return;
    }
    searchDonor.mutate(searchId, {
      onSuccess: (res) => {
        if (res.data) {
          toast.success('تم العثور على المتبرع، تم ملء البيانات تلقائياً');
          const d = res.data;
          updateField('name', d.name);
          updateField('gender', d.gender);
          updateField('age', String(d.age));
          updateField('phone', d.phone);
          updateField('nationalId', d.nationalId);
          updateField('bloodType', d.bloodType);
          updateField('governorate', d.city);
          if (d.address) {
            const parts = d.address.split(' - ');
            updateField('area', parts[0] || '');
            if (parts[1]) updateField('district', parts[1]);
          }
        } else {
          toast.info('متبرع جديد، يرجى إدخال البيانات');
          updateField('nationalId', searchId);
        }
      },
      onError: () => {
        toast.error('حدث خطأ أثناء البحث');
      }
    });
  };

  const handleNextStep = async () => {
    const step1Fields: (keyof SimpleForm)[] = [
      'name',
      'gender',
      'age',
      'phone',
      'nationalId',
      'area',
    ];
    if (getValues('source') === 'campaign') {
      step1Fields.push('campaignId');
    }
    const isValid = await trigger(step1Fields);
    if (isValid) {
      setSubmitting(true);
      const values = getValues();
      addDonation.mutate(
        {
          name: values.name,
          gender: values.gender as Donor['gender'],
          age: Number(values.age),
          phone: values.phone,
          nationalId: values.nationalId,
          city: values.governorate,
          address: [values.area, values.district].filter(Boolean).join(' - '),
          bloodType: values.bloodType as BloodType,
          donationType: values.donationType as DonationType,
          source: values.source,
          campaignId: values.campaignId || undefined,
        },
        {
          onSuccess: (res) => {
            setDonationId(res.data.donationId);
            toast.success('تم تسجيل التبرع המبدئي بنجاح');
            setStep(2);
          },
          onError: () => {
            toast.error('تعذر تسجيل التبرع المبدئي، حاول مرة أخرى');
          },
          onSettled: () => {
            setSubmitting(false);
          },
        }
      );
    }
  };

  const submitForm = handleSubmit((values) => {
    if (!donationId) return;
    setSubmitting(true);
    addMedicalRecord.mutate(
      {
        donationId,
        payload: {
          status: values.status as DonorStatus,
          diseases: values.diseases,
          additionalData: {
            weight: Number(values.weight),
            bloodPressure: values.bloodPressure,
            hemoglobin: Number(values.hemoglobin),
          },
          isAllergic: values.isAllergic,
          rejectionReason: values.rejectionReason || undefined,
          deferredUntil: values.deferredUntil || undefined,
        }
      },
      {
        onSuccess: () => {
          toast.success('تم تسجيل البيانات الطبية بنجاح');
          navigate('/doctor/donations');
        },
        onError: () => {
          toast.error('تعذر تسجيل التبرع، حاول مرة أخرى');
        },
        onSettled: () => {
          setSubmitting(false);
        },
      },
    );
  });

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step !== 2) {
      void handleNextStep();
      return;
    }
    submitForm();
  };


  const selectedCampaign = activeCampaigns.find((c) => c.id === form.campaignId);




  // ── Registration Form ──
  return (
    <Form {...formMethods}>
      <form onSubmit={handleFormSubmit} className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-gray-900" style={{ fontSize: '22px', fontWeight: 800 }}>
            تسجيل تبرع جديد
          </h1>
          <p className="text-gray-500" style={{ fontSize: '14px' }}>
            أدخل البيانات الأساسية للمتبرع
          </p>
        </div>

        {/* Appointment pre-fill banner */}
        {appointment && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-800" style={{ fontSize: '14px', fontWeight: 700 }}>
                📱 موعد محجوز من التطبيق — {appointment.time}
              </p>
              <p className="text-blue-600" style={{ fontSize: '12px' }}>
                تم جلب بيانات المتبرع تلقائياً. يمكنك تعديلها إذا لزم الأمر، ثم أضف البيانات الطبية
                في الخطوة التالية.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
          {/* ── Step Indicator ── */}
          <div className="flex items-center gap-3 pb-1">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${step >= 1 ? 'bg-green-600' : 'bg-gray-200'}`}
              >
                {step > 1 ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <span className="text-white" style={{ fontSize: '13px', fontWeight: 800 }}>
                    1
                  </span>
                )}
              </div>
              <span
                className={`${step === 1 ? 'text-green-700' : 'text-gray-400'} text-center`}
                style={{ fontSize: '11px', fontWeight: 600 }}
              >
                البيانات
                <br />
                الأساسية
              </span>
            </div>
            <div className="flex-1 mb-5">
              <div
                className={`h-0.5 w-full transition-all ${step > 1 ? 'bg-green-500' : 'bg-gray-200'}`}
              />
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${step === 2 ? 'bg-green-600' : 'bg-gray-200'}`}
              >
                <span
                  className={step === 2 ? 'text-white' : 'text-gray-400'}
                  style={{ fontSize: '13px', fontWeight: 800 }}
                >
                  2
                </span>
              </div>
              <span
                className={`${step === 2 ? 'text-green-700' : 'text-gray-400'} text-center`}
                style={{ fontSize: '11px', fontWeight: 600 }}
              >
                البيانات
                <br />
                الطبية
              </span>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* ── Step Content ── */}
          {step === 1 && (
            <>
              {/* Search Bar */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value.replace(/\D/g, '').slice(0, 14))}
                  placeholder="ابحث بالرقم القومي (14 رقم)"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={searchDonor.isPending}
                  className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50"
                  style={{ fontSize: '14px', fontWeight: 600 }}
                >
                  {searchDonor.isPending ? 'جاري البحث...' : 'بحث'}
                </button>
              </div>

              <div className="border-t border-gray-100 mb-4" />

              <StepOne
                form={form}
                register={register}
                errors={errors}
                activeCampaigns={activeCampaigns}
                selectedCampaign={selectedCampaign}
                updateField={updateField}
                onNext={handleNextStep}
              />
            </>
          )}

          {step === 2 && (
            <StepTwo
              form={form}
              register={register}
              errors={errors}
              submitting={submitting}
              updateField={updateField}
              toggleDisease={toggleDisease}
              onBack={() => setStep(1)}
            />
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/doctor/donations')}
            className="flex-1 py-3.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            إلغاء
          </button>
        </div>
      </form>
    </Form>
  );
}
