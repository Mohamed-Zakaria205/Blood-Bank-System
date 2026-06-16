import { Search, Trash2, Package, Check, X } from 'lucide-react';
import type { BloodBag } from '../../../types';
import {
  DISPOSAL_REASONS,
  donTypeLabels,
  BagStatusChip,
  getCurrentUserName,
} from './disposalConstants';

interface DisposalFormProps {
  bagSearch: string;
  onBagSearchChange: (v: string) => void;
  candidateBags: BloodBag[];
  selectedBagIds: string[];
  selectedBagsData: BloodBag[];
  category: string;
  targetStatus: 'disposed' | 'rejected';
  notes: string;
  formErrors: Record<string, string>;
  onToggleSelect: (bagId: string) => void;
  onCategoryChange: (val: string) => void;
  onTargetStatusChange: (val: 'disposed' | 'rejected') => void;
  onNotesChange: (val: string) => void;
  onOpenConfirm: () => void;
}

export default function DisposalForm({
  bagSearch,
  onBagSearchChange,
  candidateBags,
  selectedBagIds,
  selectedBagsData,
  category,
  targetStatus,
  notes,
  formErrors,
  onToggleSelect,
  onCategoryChange,
  onTargetStatusChange,
  onNotesChange,
  onOpenConfirm,
}: DisposalFormProps) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Form header */}
      <div
        className="flex items-center gap-3 px-6 py-4 border-b border-border"
        style={{ background: 'linear-gradient(to left, #fff7f7, #fff)' }}
      >
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
          <Trash2 className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h2 className="text-foreground" style={{ fontSize: '15px', fontWeight: 700 }}>
            تسجيل إتلاف جديد
          </h2>
          <p className="text-muted-foreground" style={{ fontSize: '11px' }}>
            حدد الحقيبة (أو أكثر) وأدخل تفاصيل الإتلاف
          </p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* ── Bag selection ── */}
        <div>
          <label
            className="block text-foreground mb-2"
            style={{ fontSize: '13px', fontWeight: 600 }}
          >
            تحديد الحقيبة / الحقائب <span className="text-red-500">*</span>
          </label>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={bagSearch}
              onChange={(e) => onBagSearchChange(e.target.value)}
              placeholder="بحث بكود الحقيبة أو فصيلة الدم..."
              className="w-full pr-9 pl-4 py-2.5 border border-border rounded-xl bg-muted/40 text-foreground outline-none focus:border-red-300"
              style={{ fontSize: '13px' }}
            />
          </div>

          {/* Bag table */}
          <div
            className="border border-border rounded-xl overflow-x-auto"
            style={{ maxHeight: '220px', overflowY: 'auto' }}
          >
            {candidateBags.length === 0 ? (
              <div className="py-10 text-center">
                <Package className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-muted-foreground" style={{ fontSize: '13px' }}>
                  لا توجد حقائب مطابقة للبحث
                </p>
              </div>
            ) : (
              <table className="w-full">
                <tbody className="divide-y divide-border">
                  {candidateBags.map((bag) => {
                    const isSelected = selectedBagIds.includes(bag.id);
                    return (
                      <tr
                        key={bag.id}
                        onClick={() => onToggleSelect(bag.id)}
                        className={`cursor-pointer transition-colors hover:bg-muted/40 ${isSelected ? 'bg-red-50/70' : ''}`}
                      >
                        <td className="px-3 py-2.5 w-10">
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-red-600 border-red-600'
                                : 'border-border hover:border-red-400'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className="font-mono text-green-700 bg-green-50 px-2 py-0.5 rounded"
                            style={{ fontSize: '11px', fontWeight: 700 }}
                          >
                            {bag.bagCode}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className="px-2 py-0.5 bg-red-50 text-red-600 rounded"
                            style={{ fontSize: '12px', fontWeight: 800 }}
                          >
                            {bag.bloodType}
                          </span>
                        </td>
                        <td
                          className="px-3 py-2.5 text-muted-foreground"
                          style={{ fontSize: '11px' }}
                        >
                          {donTypeLabels[bag.donationType]}
                        </td>
                        <td className="px-3 py-2.5">
                          <BagStatusChip bag={bag} />
                        </td>
                        <td
                          className="px-3 py-2.5 text-muted-foreground"
                          style={{ fontSize: '10px' }}
                        >
                          {bag.expiryDate}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Selected chips */}
          {selectedBagsData.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {selectedBagsData.map((bag) => (
                <span
                  key={bag.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 rounded-lg"
                >
                  <span
                    className="font-mono text-red-700"
                    style={{ fontSize: '11px', fontWeight: 700 }}
                  >
                    {bag.bagCode}
                  </span>
                  <span className="text-red-400" style={{ fontSize: '10px', fontWeight: 700 }}>
                    {bag.bloodType}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelect(bag.id);
                    }}
                    className="text-red-300 hover:text-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          {formErrors.bags && (
            <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
              {formErrors.bags}
            </p>
          )}
        </div>

        {/* ── Category + Status ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              className="block text-foreground mb-1.5"
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              سبب الإتلاف <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-xl bg-muted/40 text-foreground outline-none focus:border-red-300 ${formErrors.category ? 'border-red-300' : 'border-border'}`}
              style={{ fontSize: '13px' }}
            >
              <option value="">— اختر السبب —</option>
              {DISPOSAL_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.icon} {r.label}
                </option>
              ))}
            </select>
            {formErrors.category && (
              <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
                {formErrors.category}
              </p>
            )}
          </div>

          <div>
            <label
              className="block text-foreground mb-1.5"
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              الحالة الجديدة للحقيبة
            </label>
            <div className="flex gap-4 pt-2">
              {(
                [
                  ['disposed', '🗑️ مُتلَف'],
                  ['rejected', '🚫 مرفوض'],
                ] as [string, string][]
              ).map(([val, lbl]) => (
                <label key={val} className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => onTargetStatusChange(val as 'disposed' | 'rejected')}
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                      targetStatus === val ? 'border-red-600' : 'border-border'
                    }`}
                  >
                    {targetStatus === val && <div className="w-2 h-2 rounded-full bg-red-600" />}
                  </div>
                  <span className="text-foreground" style={{ fontSize: '13px' }}>
                    {lbl}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ── Notes ── */}
        <div>
          <label
            className="block text-foreground mb-1.5"
            style={{ fontSize: '13px', fontWeight: 600 }}
          >
            ملاحظات إضافية <span className="text-muted-foreground">(اختياري)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={2}
            placeholder="أي تفاصيل إضافية حول سبب الإتلاف أو حالة الحقيبة..."
            className="w-full px-4 py-2.5 border border-border rounded-xl bg-muted/40 text-foreground outline-none focus:border-red-300 resize-none"
            style={{ fontSize: '13px' }}
          />
        </div>

        {/* Staff info */}
        <div className="flex items-center gap-2 p-3 bg-muted/40 border border-border rounded-xl">
          <span style={{ fontSize: '14px' }}>📋</span>
          <p className="text-muted-foreground" style={{ fontSize: '11px' }}>
            سيتم تسجيل هذا الإتلاف تلقائياً باسم{' '}
            <strong className="text-foreground">{getCurrentUserName()}</strong> مع التاريخ والوقت
            الحالي
          </p>
        </div>

        {/* Submit */}
        <button
          onClick={onOpenConfirm}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
            selectedBagIds.length > 0
              ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
          style={{ fontSize: '14px', fontWeight: 700 }}
        >
          <Trash2 className="w-4 h-4" />
          {selectedBagIds.length > 0
            ? `تسجيل إتلاف ${selectedBagIds.length === 1 ? 'الحقيبة' : `${selectedBagIds.length} حقائب`}`
            : 'حدد حقيبة واحدة على الأقل'}
        </button>
      </div>
    </div>
  );
}
