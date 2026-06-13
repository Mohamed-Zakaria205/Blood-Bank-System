import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Check, Smartphone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFilteredCampaigns } from '../../hooks/useCampaigns';
import { useAppointmentSlotById } from '../../hooks/useAppointments';
import { useAddDonation, useAddMedicalRecord, useSearchDonor, useDonationCenters, useDeleteDonation } from '../../hooks/useDonors';
import { toast } from 'sonner';
import { useForm, Path, PathValue } from 'react-hook-form';
import { Form } from '../ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { BloodType, DonationType, DonorStatus } from '../../types/common';
import type { Donor } from '../../types/donor';
import { EGYPT_DATA } from '../../data/egypt';

import { extractDobFromNationalId, normalizeDateToISO } from '../../utils/dateUtils';
// ── Sub-components ──
import { donorSchema, initialForm, type SimpleForm } from './donation-registration/donationFormSchema';
import StepOne from './donation-registration/StepOne';
import StepTwo from './donation-registration/StepTwo';



export default function DonationRegistrationForm() {
  const navigate = useNavigate();
  useAuth();
  const [searchParams] = useSearchParams();
  const { data: filteredCampaigns } = useFilteredCampaigns({ status: 'active', limit: 100 });
  const { data: donationCenters = [] } = useDonationCenters();
  const addDonation = useAddDonation();
  const addMedicalRecord = useAddMedicalRecord();
  const searchDonor = useSearchDonor();
  const deleteDonation = useDeleteDonation();
  const [donationId, setDonationId] = useState<string | null>(null);
  const [searchId, setSearchId] = useState('');

  // Pre-fill from appointment — fetch the specific slot by ID
  const aptId = searchParams.get('apt');
  // campaignId passed in URL as a fallback (e.g. when navigating from CampaignCard)
  const urlCampaignId = searchParams.get('campaignId') || '';
  const { data: appointment = null } = useAppointmentSlotById(aptId);

  const lastResetAptIdRef = useRef<string | undefined>(undefined);

  const getInitialForm = useCallback((): SimpleForm => {
    if (appointment) {
      const birthYear = appointment.donorAge
        ? (appointment.donorAge > 120
          ? appointment.donorAge
          : new Date().getFullYear() - appointment.donorAge)
        : null;
      const approxDob = birthYear ? `${String(birthYear).padStart(4, '0')}-01-01` : '';
      const finalDob = appointment.donorDateOfBirth
        ? normalizeDateToISO(appointment.donorDateOfBirth)
        : (appointment.donorNationalId
          ? extractDobFromNationalId(appointment.donorNationalId)
          : approxDob);
      // Determine the donation source based on appointment metadata
      // Use campaignId from the appointment slot, or fall back to the URL param
      const resolvedCampaignId = appointment.campaignId || urlCampaignId;
      let source: SimpleForm['source'] = 'app';
      if (resolvedCampaignId) {
        source = 'campaign';
      } else if (appointment.centerId) {
        source = 'walkin';
      }

      return {
        ...initialForm,
        name: appointment.donorName || '',
        gender: appointment.donorGender || '',
        dateOfBirth: finalDob,
        phone: appointment.donorPhone || '',
        nationalId: appointment.donorNationalId || '',
        governorate: appointment.donorGovernorate || 'بني سويف',
        district: appointment.donorDistrict || 'مركز وبندر بني سويف',
        area: appointment.donorArea || '',
        bloodType: appointment.donorBloodType || '',
        donationType: appointment.donationType || 'wholeblood',
        source: source,
        campaignId: resolvedCampaignId,
        // donationCenterId is ALWAYS a DonationCenter GUID — never a campaignId.
        // For campaign appointments: the backend returns centerId on the appointment slot
        //   which is the GUID of the DonationCenter associated with the campaign.
        // For walk-in appointments: centerId is the main branch GUID.
        donationCenterId: appointment.centerId || '',
        donationTime: appointment.time || new Date().toTimeString().slice(0, 5),
      };
    }
    return initialForm;
  }, [
    appointment?.id,
    appointment?.donorAge,
    appointment?.donorDateOfBirth,
    appointment?.donorNationalId,
    appointment?.campaignId,
    appointment?.centerId,
    appointment?.donorName,
    appointment?.donorGender,
    appointment?.donorPhone,
    appointment?.donorGovernorate,
    appointment?.donorDistrict,
    appointment?.donorArea,
    appointment?.donorBloodType,
    appointment?.donationType,
    appointment?.time,
    urlCampaignId,
  ]);

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
  const watchedFields = watch([
    'source',
    'donationCenterId',
    'campaignId',
    'governorate',
    'district',
    'bloodType',
    'donationType',
    'isAllergic',
    'diseases',
    'status',
  ]);

  const form: SimpleForm = {
    ...getValues(),
    source: watchedFields[0],
    donationCenterId: watchedFields[1],
    campaignId: watchedFields[2],
    governorate: watchedFields[3],
    district: watchedFields[4],
    bloodType: watchedFields[5],
    donationType: watchedFields[6],
    isAllergic: watchedFields[7],
    diseases: watchedFields[8],
    status: watchedFields[9],
  };

  useEffect(() => {
    if (submitting) return; // Prevent reset race condition if a mutation is pending

    if (lastResetAptIdRef.current !== appointment?.id) {
      lastResetAptIdRef.current = appointment?.id;
      reset(getInitialForm());
      setStep(1);
    }
  }, [appointment?.id, reset, getInitialForm, submitting]);

  // Explicitly sync address fields AFTER reset settles.
  // The controlled <select> for governorate/district reads form state via watch(),
  // so we push the values again in a microtask to guarantee they stick.
  useEffect(() => {
    if (!appointment) return;
    const gov = appointment.donorGovernorate?.trim() || '';
    const dist = appointment.donorDistrict?.trim() || '';
    const area = appointment.donorArea?.trim() || '';
    if (gov) setValue('governorate', gov, { shouldDirty: true });
    if (dist) setValue('district', dist, { shouldDirty: true });
    if (area) setValue('area', area, { shouldDirty: true });
  }, [
    appointment?.donorGovernorate,
    appointment?.donorDistrict,
    appointment?.donorArea,
    setValue,
  ]);

  useEffect(() => {
    register('source');
    register('gender');
    register('bloodType');
    register('donationType');
    register('status');
    register('diseases');
    register('isAllergic');
    register('governorate');
    register('district');
    register('area');
    register('donationTime');
    register('donationCenterId');
  }, [register]);

  // Auto-select the donation center when there's only one option and source is walkin
  useEffect(() => {
    if (donationCenters.length === 1 && form.source === 'walkin' && !form.donationCenterId) {
      setValue('donationCenterId', donationCenters[0].id, { shouldDirty: true, shouldValidate: true });
    }
  }, [donationCenters, form.source, form.donationCenterId, setValue]);

  const activeCampaigns = filteredCampaigns?.data || [];

  const updateField = <K extends keyof SimpleForm>(key: K, value: SimpleForm[K]) => {
    setValue(key as Path<SimpleForm>, value as PathValue<SimpleForm, Path<SimpleForm>>, {
      shouldDirty: true,
      shouldValidate: true,
    });
    if (key === 'source') {
      if (value !== 'campaign') {
        setValue('campaignId', '', { shouldDirty: true, shouldValidate: true });
      }
      if (value !== 'walkin') {
        setValue('donationCenterId', '', { shouldDirty: true, shouldValidate: true });
      }
    }
  };

  const toggleDisease = (id: string) => {
    const current = getValues('diseases') || [];
    const next = current.includes(id) ? current.filter((d) => d !== id) : [...current, id];
    setValue('diseases', next, { shouldDirty: true, shouldValidate: true });
  };

  // Abort controller ref — cancels in-flight search when the component unmounts
  // or when the user triggers a new search before the previous one finishes.
  const searchAbortRef = useRef<AbortController | null>(null);

  const handleSearch = () => {
    if (!searchId || searchId.length !== 14) {
      toast.error('يرجى إدخال رقم قومي صحيح (14 رقم)');
      return;
    }
    // Abort any previous in-flight request
    searchAbortRef.current?.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;
    searchDonor.mutate(searchId, {
      onSuccess: (res) => {
        const exactDob = extractDobFromNationalId(searchId);
        if (res.data) {
          toast.success('تم العثور على المتبرع، تم ملء البيانات تلقائياً');
          const d = res.data;
          updateField('name', d.name);
          updateField('gender', d.gender);
          let finalDob = exactDob;
          // Fallback 1: use dateOfBirth returned by the API (normalize to yyyy-MM-dd)
          if (!finalDob && d.dateOfBirth) {
            finalDob = normalizeDateToISO(d.dateOfBirth);
          }
          // Fallback 2: approximate from age
          if (!finalDob && d.age) {
            const birthYear = d.age > 150 ? d.age : new Date().getFullYear() - d.age;
            finalDob = `${String(birthYear).padStart(4, '0')}-01-01`;
          }
          updateField('dateOfBirth', finalDob);
          updateField('phone', d.phone);
          updateField('nationalId', d.nationalId);
          updateField('bloodType', d.bloodType || '');
          const gov = d.governorate || 'بني سويف';
          let dist = d.district || 'مركز وبندر بني سويف';

          const govObj = EGYPT_DATA.find((g) => g.name_ar === gov);
          if (govObj) {
            const exactDist = govObj.cities.find((c) => c.city_name_ar === dist);
            if (!exactDist) {
              const partialDist = govObj.cities.find(
                (c) => c.city_name_ar.includes(dist) || dist.includes(c.city_name_ar)
              );
              if (partialDist) dist = partialDist.city_name_ar;
            }
          }

          updateField('governorate', gov);
          updateField('district', dist);
          updateField('area', d.area || '');
        } else {
          toast.info('متبرع جديد، يرجى إدخال البيانات');
          updateField('nationalId', searchId);
          if (exactDob) {
            updateField('dateOfBirth', exactDob);
          }
        }
      },
      onError: () => {
        toast.error('حدث خطأ أثناء البحث');
      }
    });
  };

  const handleNextStep = async () => {
    if (addDonation.isPending || submitting) return;
    const step1Fields: (keyof SimpleForm)[] = [
      'name',
      'gender',
      'dateOfBirth',
      'phone',
      'nationalId',
      'area',
    ];
    if (getValues('source') === 'campaign') {
      step1Fields.push('campaignId');
    }
    if (getValues('source') === 'walkin') {
      step1Fields.push('donationCenterId');
    }
    const isValid = await trigger(step1Fields);
    if (isValid) {
      setSubmitting(true);
      const values = getValues();
      addDonation.mutate(
        {
          name: values.name,
          gender: values.gender as Donor['gender'],
          dateOfBirth: values.dateOfBirth,
          phone: values.phone,
          nationalId: values.nationalId,
          governorate: values.governorate,
          district: values.district,
          area: values.area,
          source: values.source,
          // donationCenterId is ALWAYS a valid DonationCenter GUID.
          // For campaign appointments: values.donationCenterId holds appointment.centerId
          //   (the campaign's DonationCenter GUID, set in getInitialForm).
          // For walk-in: values.donationCenterId holds the selected branch center GUID.
          // NEVER use campaignId as donationCenterId — they are different identifiers.
          donationCenterId: values.donationCenterId || undefined,
          // campaignId is a separate field — only sent when source is 'campaign'
          campaignId:
            values.source === 'campaign' ? values.campaignId || undefined : undefined,
        },
        {
          onSuccess: (res) => {
            const actualId =
              res.data && typeof res.data === 'object'
                ? (res.data as { id: string }).id
                : (res.data as string);
            setDonationId(actualId);
            toast.success('تم تسجيل التبرع المبدئي بنجاح');
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
          bloodType: values.bloodType ? (values.bloodType as BloodType) : undefined,
          donationType: values.donationType as DonationType,
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
    if (submitting || addDonation.isPending || addMedicalRecord.isPending) return;
    if (step !== 2) {
      void handleNextStep();
      return;
    }
    submitForm();
  };


  const selectedCampaign = activeCampaigns.find((c) => c.id === form.campaignId);
  const selectedCenter = donationCenters.find((c) => c.id === form.donationCenterId);




  // ── Registration Form ──
  return (
    <Form {...formMethods}>
      <form onSubmit={handleFormSubmit} className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-foreground" style={{ fontSize: '22px', fontWeight: 800 }}>
            تسجيل تبرع جديد
          </h1>
          <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
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

        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-5">
          {/* ── Step Indicator ── */}
          <div className="flex items-center gap-3 pb-1">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${step >= 1 ? 'bg-green-600' : 'bg-muted'}`}
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
                className={`${step === 1 ? 'text-green-700' : 'text-muted-foreground'} text-center`}
                style={{ fontSize: '11px', fontWeight: 600 }}
              >
                البيانات
                <br />
                الأساسية
              </span>
            </div>
            <div className="flex-1 mb-5">
              <div
                className={`h-0.5 w-full transition-all ${step > 1 ? 'bg-green-500' : 'bg-muted'}`}
              />
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${step === 2 ? 'bg-green-600' : 'bg-muted'}`}
              >
                <span
                  className={step === 2 ? 'text-white' : 'text-muted-foreground'}
                  style={{ fontSize: '13px', fontWeight: 800 }}
                >
                  2
                </span>
              </div>
              <span
                className={`${step === 2 ? 'text-green-700' : 'text-muted-foreground'} text-center`}
                style={{ fontSize: '11px', fontWeight: 600 }}
              >
                البيانات
                <br />
                الطبية
              </span>
            </div>
          </div>

          <div className="border-t border-border" />

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
                  className="flex-1 px-4 py-3 border border-border rounded-xl bg-muted/40 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
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

              <div className="border-t border-border mb-4" />

              <StepOne
                form={form}
                register={register}
                errors={errors}
                activeCampaigns={activeCampaigns}
                selectedCampaign={selectedCampaign}
                donationCenters={donationCenters}
                selectedCenter={selectedCenter}
                updateField={updateField}
                onNext={handleNextStep}
                submitting={submitting}
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
              onBack={() => {
                if (donationId) {
                  deleteDonation.mutate(donationId);
                  setDonationId(null);
                }
                setStep(1);
              }}
            />
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              if (donationId && step === 2) {
                deleteDonation.mutate(donationId);
              }
              navigate('/doctor/donations');
            }}
            className="flex-1 py-3.5 border border-border text-muted-foreground rounded-xl hover:bg-muted/40 transition-all"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            إلغاء
          </button>
        </div>
      </form>
    </Form>
  );
}
