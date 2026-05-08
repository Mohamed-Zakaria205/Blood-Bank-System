import { useState } from 'react';
import type { BloodType, LabTest } from '../../../types';
import { useSubmitLabResult } from '../../../hooks/useLabTests';
import type { ScreeningForm } from '../lab-dashboard/labConstants';
import { defaultScreeningForm } from '../lab-dashboard/labConstants';

export function useLabDashboardForm() {
  const submitLabResult = useSubmitLabResult();

  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [entryModal, setEntryModal] = useState<LabTest | null>(null);
  const [viewModal, setViewModal] = useState<LabTest | null>(null);
  const [form, setForm] = useState<ScreeningForm | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const openEntry = (test: LabTest) => {
    setEntryModal(test);
    setForm(defaultScreeningForm(test.bloodType));
    setErrors({});
  };

  const isUnsafe = form
    ? form.hcv === 'positive' ||
      form.hbv === 'positive' ||
      form.syphilis === 'positive' ||
      form.hiv === 'positive'
    : false;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form?.confirmedBloodType) e.bloodType = 'تأكيد فصيلة الدم مطلوب';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitResult = async () => {
    if (!validate() || !entryModal || !form) return;
    setSubmitting(true);
    try {
      await submitLabResult.mutateAsync({
        testId: entryModal.id,
        result: {
          confirmedBloodType: form.confirmedBloodType as BloodType,
          hcv: form.hcv,
          hbv: form.hbv,
          syphilis: form.syphilis,
          hiv: form.hiv,
          notes: form.notes,
          suitable: !isUnsafe,
        },
      });
      setEntryModal(null);
      setSuccessMsg(
        `تم إدخال نتائج حقيبة ${entryModal.bloodType} — ${entryModal.donorCode} بنجاح (${!isUnsafe ? 'آمنة ✅' : 'غير آمنة ⚠️'})`,
      );
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    entryModal,
    setEntryModal,
    viewModal,
    setViewModal,
    form,
    setForm,
    errors,
    submitting,
    successMsg,
    setSuccessMsg,
    openEntry,
    isUnsafe,
    submitResult,
  };
}
