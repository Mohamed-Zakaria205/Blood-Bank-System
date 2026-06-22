import { useMemo, useEffect } from 'react';
import { X, Check, Clock, Users, LayoutGrid, Info, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { CITIES } from '../../../constants';
import type { CampaignFormState } from './campaignConstants';
import { DURATION_OPTIONS, buildSlots } from './campaignConstants';
import { useModalFocusTrap } from '../../../hooks/useModalFocusTrap';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';

// Fix for default leaflet marker icons in React
delete (L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ── Location Selector Map (internal) ──

function LocationSelectorMap({
  lat,
  lng,
  onChange,
}: {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}) {
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        onChange(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  const MapUpdater = ({ lat, lng }: { lat: number; lng: number }) => {
    const map = useMap();
    useEffect(() => {
      map.flyTo([lat, lng], map.getZoom(), { animate: true });
    }, [lat, lng, map]);
    return null;
  };

  return (
    <div
      style={{
        height: '250px',
        width: '100%',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        zIndex: 10,
      }}
    >
      <MapContainer center={[lat, lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} />
        <MapEvents />
        <MapUpdater lat={lat} lng={lng} />
      </MapContainer>
    </div>
  );
}

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
  onSave: () => void;
  onClose: () => void;
  isEditing?: boolean;
}

export default function CreateCampaignModal({
  form,
  errors,
  onUpdateForm,
  onSave,
  onClose,
  isEditing,
}: CreateCampaignModalProps) {
  const computedSlots = useMemo(
    () => buildSlots(form.startTime, form.endTime, form.slotDuration, form.slotCapacity),
    [form.startTime, form.endTime, form.slotDuration, form.slotCapacity],
  );
  const totalCapacity = computedSlots.length * (parseInt(form.slotCapacity) || 1);

  const defaultLat = 29.0661;
  const defaultLng = 31.0994;
  const currentLat = form.latitude ? parseFloat(form.latitude) : defaultLat;
  const currentLng = form.longitude ? parseFloat(form.longitude) : defaultLng;
  const modalRef = useModalFocusTrap(onClose);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('متصفحك لا يدعم تحديد الموقع');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onUpdateForm((p) => ({
          ...p,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        }));
        toast.success('تم تحديد الموقع بنجاح');
      },
      () => {
        toast.error('تعذر تحديد موقعك، يرجى التحقق من الصلاحيات');
      },
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto outline-none"
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3
            id="modal-title"
            className="text-foreground"
            style={{ fontSize: '18px', fontWeight: 800 }}
          >
            {isEditing ? 'تعديل بيانات الحملة' : 'إنشاء حملة جديدة'}
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
            <div className="col-span-2">
              <label
                className="block text-foreground mb-1.5"
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                موقع الحملة *
              </label>
              <div className="flex flex-col gap-3 mb-3">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all border border-blue-200"
                  style={{ fontSize: '13px', fontWeight: 600 }}
                >
                  <MapPin className="w-4 h-4" /> تحديد موقعي الحالي
                </button>
                <LocationSelectorMap
                  lat={currentLat}
                  lng={currentLng}
                  onChange={(lat, lng) =>
                    onUpdateForm((p) => ({
                      ...p,
                      latitude: lat.toString(),
                      longitude: lng.toString(),
                    }))
                  }
                />
                <span className="text-muted-foreground" style={{ fontSize: '11px' }}>
                  يمكنك أيضاً النقر على الخريطة لتحديد موقع الحملة بدقة.
                </span>
              </div>
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

          {/* ── Available Donation Types ── */}
          <div>
            <label
              className="block text-foreground mb-1.5"
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              أنواع التبرع المتاحة *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'wholeblood', label: 'دم كامل' },
                { value: 'plasma', label: 'بلازما' },
                { value: 'platelets', label: 'صفائح دموية' },
              ].map((opt) => {
                const isSelected = form.availableDonationTypes?.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      const currentTypes = form.availableDonationTypes || [];
                      const newTypes = isSelected
                        ? currentTypes.filter((t) => t !== opt.value)
                        : [...currentTypes, opt.value];
                      onUpdateForm((p) => ({ ...p, availableDonationTypes: newTypes }));
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border transition-all ${isSelected
                        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                        : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted'
                      }`}
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isSelected
                          ? 'border-blue-600 bg-blue-600 dark:border-blue-500 dark:bg-blue-500'
                          : 'border-muted-foreground'
                        }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {errors.availableDonationTypes && (
              <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
                {errors.availableDonationTypes}
              </p>
            )}
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
                      <span className="text-blue-700" style={{ fontSize: '12px', fontWeight: 700 }}>
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
                    <p className="text-blue-700" style={{ fontSize: '11px', lineHeight: '1.6' }}>
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

          {/* ── Recurrence Settings ── */}
          <div className="p-5 border border-border rounded-xl bg-muted/20">
            <h4 className="text-foreground mb-4" style={{ fontSize: '15px', fontWeight: 700 }}>
              تكرار الحملة
            </h4>
            <div className="space-y-4">
              <div>
                <label
                  className="block text-foreground mb-1.5"
                  style={{ fontSize: '13px', fontWeight: 600 }}
                >
                  معدل التكرار
                </label>
                <select
                  value={form.recurrenceType}
                  onChange={(e) =>
                    onUpdateForm((p) => ({
                      ...p,
                      recurrenceType: e.target.value as CampaignFormState['recurrenceType'],
                      recurrenceDays: [],
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                  style={{ fontSize: '13px' }}
                >
                  <option value="none">لا تتكرر (افتراضي)</option>
                  <option value="daily">يومياً</option>
                  <option value="weekly">أسبوعياً</option>
                  <option value="monthly">شهرياً</option>
                  <option value="custom">مخصص (أيام محددة في الأسبوع)</option>
                </select>
              </div>

              {form.recurrenceType === 'custom' && (
                <div>
                  <label
                    className="block text-foreground mb-1.5"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    أيام التكرار
                  </label>
                  <div className="flex flex-row-reverse flex-wrap gap-2 text-center" dir="ltr">
                    {[
                      { name: 'السبت', value: 6 },
                      { name: 'الأحد', value: 0 },
                      { name: 'الإثنين', value: 1 },
                      { name: 'الثلاثاء', value: 2 },
                      { name: 'الأربعاء', value: 3 },
                      { name: 'الخميس', value: 4 },
                      { name: 'الجمعة', value: 5 }
                    ].map(
                      (item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => {
                            const isSelected = form.recurrenceDays.includes(item.value);
                            const newDays = isSelected
                              ? form.recurrenceDays.filter((d) => d !== item.value)
                              : [...form.recurrenceDays, item.value];
                            onUpdateForm((p) => ({ ...p, recurrenceDays: newDays }));
                          }}
                          className={`flex-1 min-w-[40px] py-2 px-2 rounded-lg border transition-all ${form.recurrenceDays.includes(item.value) ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted'}`}
                          style={{ fontSize: '12px', fontWeight: 600 }}
                        >
                          {item.name}
                        </button>
                      ),
                    )}
                  </div>
                  {errors.recurrence && (
                    <p className="text-red-500 mt-1 text-right" style={{ fontSize: '11px' }}>
                      {errors.recurrence}
                    </p>
                  )}
                </div>
              )}

              {form.recurrenceType !== 'none' && (
                <div>
                  <label
                    className="block text-foreground mb-1.5"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    تاريخ انتهاء التكرار (اختياري)
                  </label>
                  <input
                    type="date"
                    value={form.recurrenceEndDate || ''}
                    onChange={(e) =>
                      onUpdateForm((p) => ({ ...p, recurrenceEndDate: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                    style={{ fontSize: '13px' }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 sm:p-6 border-t border-border bg-muted/30 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
            style={{ fontSize: '14px', fontWeight: 700 }}
          >
            إلغاء
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2.5 rounded-xl text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm"
            style={{ fontSize: '14px', fontWeight: 700 }}
          >
            {isEditing ? 'حفظ التعديلات' : 'تأكيد وإنشاء'}
          </button>
        </div>
      </div>
    </div>
  );
}
