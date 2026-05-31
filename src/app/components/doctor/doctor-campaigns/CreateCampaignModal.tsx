import { useMemo } from 'react';
import {
  Plus,
  X,
  Check,
  Clock,
  Users,
  LayoutGrid,
  Info,
} from 'lucide-react';
import { CITIES } from '../../../constants';
import type { CampaignFormState } from './campaignConstants';
import { DURATION_OPTIONS, buildSlots } from './campaignConstants';

// ── Slot Preview Card (internal) ──

interface GeneratedSlot {
  time: string;
  endTime: string;
  capacity: number;
  booked: number;
}

function SlotPreviewCard({ slot, index }: { slot: GeneratedSlot; index: number }) {
  const fill = slot.capacity === 0 ? 0 : slot.booked / slot.capacity;
  const isFull = slot.booked >= slot.capacity;
  const isNearFull = !isFull && fill >= 0.5;

  const borderColor = isFull
    ? 'border-red-200'
    : isNearFull
      ? 'border-orange-200'
      : 'border-green-200';
  const bgColor = isFull ? 'bg-red-50' : isNearFull ? 'bg-orange-50' : 'bg-green-50';
  const timeColor = isFull ? 'text-red-600' : isNearFull ? 'text-orange-600' : 'text-green-700';
  const badgeColor = isFull ? 'bg-red-500' : isNearFull ? 'bg-orange-400' : 'bg-green-500';
  const label = isFull ? 'ممتلئ' : isNearFull ? 'يوشك' : 'متاح';

  return (
    <div
      className={`rounded-xl border ${borderColor} ${bgColor} p-2.5 flex flex-col items-center gap-1.5 min-w-0`}
    >
      <span className="text-muted-foreground" style={{ fontSize: '9px', fontWeight: 700 }}>
        #{index + 1}
      </span>
      <span
        className={`font-mono ${timeColor}`}
        style={{ fontSize: '12px', fontWeight: 800 }}
        dir="ltr"
      >
        {slot.time}
      </span>
      <span className="text-muted-foreground" style={{ fontSize: '9px' }} dir="ltr">
        ↓ {slot.endTime}
      </span>
      <div className="flex gap-1 flex-wrap justify-center mt-0.5">
        {Array.from({ length: slot.capacity }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${i < slot.booked ? 'bg-red-400' : 'bg-muted'}`}
          />
        ))}
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-muted-foreground" style={{ fontSize: '10px', fontWeight: 600 }}>
          {slot.booked}/{slot.capacity}
        </span>
        <span
          className={`px-1.5 py-0.5 rounded-full text-white ${badgeColor}`}
          style={{ fontSize: '9px', fontWeight: 700 }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

// ── Main Modal ──

interface CreateCampaignModalProps {
  form: CampaignFormState;
  errors: Record<string, string>;
  onUpdateForm: (updater: (prev: CampaignFormState) => CampaignFormState) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export default function CreateCampaignModal({
  form,
  errors,
  onUpdateForm,
  onSubmit,
  onClose,
}: CreateCampaignModalProps) {
  const computedSlots = useMemo(
    () => buildSlots(form.startTime, form.endTime, form.slotDuration, form.slotCapacity),
    [form.startTime, form.endTime, form.slotDuration, form.slotCapacity],
  );
  const totalCapacity = computedSlots.length * (parseInt(form.slotCapacity) || 1);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-foreground" style={{ fontSize: '18px', fontWeight: 700 }}>
            إنشاء حملة تبرع جديدة
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-muted-foreground hover:bg-muted rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* ── Basic Info ── */}
          <div>
            <label
              className="block text-foreground mb-1.5"
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              عنوان الحملة *
            </label>
            <input
              value={form.title}
              onChange={(e) => onUpdateForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="مثال: حملة التبرع بالدم - مستشفى بني سويف"
              className={`w-full px-4 py-2.5 border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 ${errors.title ? 'border-red-300' : 'border-border'}`}
              style={{ fontSize: '13px' }}
            />
            {errors.title && (
              <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
                {errors.title}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-foreground mb-1.5"
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                موقع الحملة *
              </label>
              <input
                value={form.location}
                onChange={(e) => onUpdateForm((p) => ({ ...p, location: e.target.value }))}
                placeholder="اسم المستشفى أو المركز"
                className={`w-full px-4 py-2.5 border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 ${errors.location ? 'border-red-300' : 'border-border'}`}
                style={{ fontSize: '13px' }}
              />
              {errors.location && (
                <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
                  {errors.location}
                </p>
              )}
            </div>
            <div>
              <label
                className="block text-foreground mb-1.5"
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                المدينة
              </label>
              <select
                value={form.city}
                onChange={(e) => onUpdateForm((p) => ({ ...p, city: e.target.value }))}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400"
                style={{ fontSize: '13px' }}
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block text-foreground mb-1.5"
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                تاريخ الحملة *
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => onUpdateForm((p) => ({ ...p, date: e.target.value }))}
                className={`w-full px-4 py-2.5 border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400 ${errors.date ? 'border-red-300' : 'border-border'}`}
                style={{ fontSize: '13px' }}
              />
              {errors.date && (
                <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
                  {errors.date}
                </p>
              )}
            </div>
            <div>
              <label
                className="block text-foreground mb-1.5"
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                العدد المستهدف *
              </label>
              <input
                type="number"
                value={form.targetDonors}
                onChange={(e) =>
                  onUpdateForm((p) => ({
                    ...p,
                    targetDonors: e.target.value,
                  }))
                }
                placeholder="مثال: 100"
                className={`w-full px-4 py-2.5 border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400 ${errors.targetDonors ? 'border-red-300' : 'border-border'}`}
                style={{ fontSize: '13px' }}
              />
              {errors.targetDonors && (
                <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
                  {errors.targetDonors}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              className="block text-foreground mb-1.5"
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              وصف الحملة <span className="text-muted-foreground">(اختياري)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => onUpdateForm((p) => ({ ...p, description: e.target.value }))}
              rows={2}
              placeholder="تفاصيل إضافية عن الحملة..."
              className="w-full px-4 py-2.5 border border-border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400 resize-none"
              style={{ fontSize: '13px' }}
            />
          </div>

          {/* ── Slot Scheduler Section ── */}
          <div className="rounded-2xl border border-green-100 overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-3.5 bg-green-50 border-b border-green-100">
              <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                <Clock className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-green-800" style={{ fontSize: '13px', fontWeight: 700 }}>
                  جدولة أوقات الحملة
                </p>
                <p className="text-green-600" style={{ fontSize: '11px' }}>
                  حدد ساعات العمل ومدة كل فترة زمنية وسعتها
                </p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-foreground mb-1.5"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    وقت البداية
                  </label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) =>
                      onUpdateForm((p) => ({
                        ...p,
                        startTime: e.target.value,
                      }))
                    }
                    className={`w-full px-4 py-2.5 border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 font-mono ${errors.startTime ? 'border-red-300' : 'border-border'}`}
                    style={{ fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label
                    className="block text-foreground mb-1.5"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    وقت الانتهاء
                  </label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) =>
                      onUpdateForm((p) => ({
                        ...p,
                        endTime: e.target.value,
                      }))
                    }
                    className={`w-full px-4 py-2.5 border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 font-mono ${errors.startTime ? 'border-red-300' : 'border-border'}`}
                    style={{ fontSize: '13px' }}
                  />
                  {errors.startTime && (
                    <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
                      {errors.startTime}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-foreground mb-1.5"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    مدة الفترة الواحدة
                  </label>
                  <select
                    value={form.slotDuration}
                    onChange={(e) =>
                      onUpdateForm((p) => ({
                        ...p,
                        slotDuration: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                    style={{ fontSize: '13px' }}
                  >
                    {DURATION_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="block text-foreground mb-1.5"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    سعة كل فترة
                    <span className="text-muted-foreground mr-1" style={{ fontWeight: 400 }}>
                      (متبرع)
                    </span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={form.slotCapacity}
                    onChange={(e) =>
                      onUpdateForm((p) => ({
                        ...p,
                        slotCapacity: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                    style={{ fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* ── Live Preview ── */}
              {computedSlots.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 rounded-xl">
                      <LayoutGrid className="w-3.5 h-3.5 text-green-600" />
                      <span
                        className="text-green-800"
                        style={{ fontSize: '12px', fontWeight: 700 }}
                      >
                        {computedSlots.length} فترة زمنية
                      </span>
                    </div>
                    <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
                      ×
                    </span>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-xl">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      <span
                        className="text-blue-700"
                        style={{ fontSize: '12px', fontWeight: 700 }}
                      >
                        {form.slotCapacity} متبرع / فترة
                      </span>
                    </div>
                    <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
                      =
                    </span>
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg,#dcfce7,#d1fae5)',
                        border: '1px solid #86efac',
                      }}
                    >
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span
                        className="text-green-800"
                        style={{ fontSize: '12px', fontWeight: 800 }}
                      >
                        {totalCapacity} متبرع إجمالاً
                      </span>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-muted rounded-xl mr-auto">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span
                        className="text-muted-foreground font-mono"
                        style={{ fontSize: '11px', fontWeight: 600 }}
                        dir="ltr"
                      >
                        {form.startTime} – {form.endTime}
                      </span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground" style={{ fontSize: '11px' }}>
                      مؤشرات الحالة:
                    </span>
                    {[
                      { color: 'bg-green-500', label: 'متاح' },
                      { color: 'bg-orange-400', label: 'يوشك الامتلاء' },
                      { color: 'bg-red-500', label: 'ممتلئ' },
                    ].map((l) => (
                      <div key={l.label} className="flex items-center gap-1.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                        <span className="text-muted-foreground" style={{ fontSize: '11px' }}>
                          {l.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Slot grid */}
                  <div
                    className="rounded-xl border border-border bg-muted/40 p-3 overflow-y-auto"
                    style={{ maxHeight: '200px' }}
                  >
                    <div
                      className="grid gap-2"
                      style={{
                        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                      }}
                    >
                      {computedSlots.map((slot, idx) => (
                        <SlotPreviewCard key={slot.time} slot={slot} index={idx} />
                      ))}
                    </div>
                  </div>

                  {/* Info note */}
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p
                      className="text-blue-700"
                      style={{ fontSize: '11px', lineHeight: '1.6' }}
                    >
                      عند امتلاء فترة زمنية بالكامل، تُغلق تلقائياً أمام الحجوزات الجديدة. يمكن
                      للمتبرعين الحجز في الفترات المتاحة عبر التطبيق .
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center border border-dashed border-border rounded-xl bg-muted/40">
                  <Clock className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-muted-foreground" style={{ fontSize: '13px' }}>
                    حدد وقت البداية والانتهاء لمعاينة الفترات الزمنية
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-border text-muted-foreground rounded-xl hover:bg-muted/40 transition-all"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            إلغاء
          </button>
          <button
            onClick={onSubmit}
            className="flex items-center gap-2 px-6 py-2.5 text-white rounded-xl transition-all bg-green-600 hover:bg-green-700"
            style={{ fontSize: '14px', fontWeight: 700 }}
          >
            <Plus className="w-4 h-4" /> إنشاء الحملة
          </button>
        </div>
      </div>
    </div>
  );
}
