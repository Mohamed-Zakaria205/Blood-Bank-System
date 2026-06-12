import { useState, useRef } from 'react';
import { XCircle, X, CalendarDays, Clock, User, Megaphone, AlertTriangle } from 'lucide-react';
import type { AppointmentSlot } from '../../types';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';

interface CancelModalProps {
  slot: AppointmentSlot;
  doctorName: string;
  onConfirm: (reason: string) => Promise<void> | void;
  onClose: () => void;
}

export function CancelModal({ slot, doctorName, onConfirm, onClose }: CancelModalProps) {
  const [reason, setReason] = useState('');
  const [confirming, setConfirming] = useState(false);
  const isSubmittingRef = useRef(false);
  const modalRef = useModalFocusTrap(onClose);

  // Resolve the campaign name from React Query cache — zero extra network request
  const { data: campaignsData = [] } = useCampaigns();
  const campaign = slot.campaignId ? campaignsData.find((c) => c.id === slot.campaignId) : null;

  const handleConfirm = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setConfirming(true);
    try {
      await onConfirm(reason);
      onClose();
    } catch (err) {
      console.error(err);
      setConfirming(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-border outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <h3 id="modal-title" className="text-foreground" style={{ fontSize: '16px', fontWeight: 800 }}>
              إلغاء الموعد
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Warning */}
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700" style={{ fontSize: '12px', lineHeight: '1.6' }}>
              سيتم إلغاء هذا الموعد فوراً وإرسال إشعار تلقائي للمتبرع. لا يمكن التراجع عن هذا
              الإجراء.
            </p>
          </div>

          {/* Appointment summary */}
          <div className="bg-muted/40 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground" style={{ fontSize: '11px' }}>
                  المتبرع
                </p>
                <p className="text-foreground" style={{ fontSize: '14px', fontWeight: 700 }}>
                  {slot.donorName}
                </p>
              </div>
            </div>
            <div className="h-px bg-border" />
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground" style={{ fontSize: '11px' }}>
                    التاريخ
                  </p>
                  <p
                    className="text-foreground font-mono"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    {slot.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground" style={{ fontSize: '11px' }}>
                    الوقت
                  </p>
                  <p
                    className="text-foreground font-mono"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    {slot.time}
                  </p>
                </div>
              </div>
            </div>
            {campaign && (
              <>
                <div className="h-px bg-border" />
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="text-muted-foreground" style={{ fontSize: '11px' }}>
                      الحملة
                    </p>
                    <p className="text-purple-700" style={{ fontSize: '13px', fontWeight: 600 }}>
                      {campaign.title}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Doctor */}
          <div className="flex items-center justify-between px-1">
            <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
              يُلغى بواسطة
            </span>
            <span className="text-foreground" style={{ fontSize: '13px', fontWeight: 700 }}>
              {doctorName}
            </span>
          </div>

          {/* Reason */}
          <div>
            <label
              className="block text-foreground mb-1.5"
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              سبب الإلغاء{' '}
              <span className="text-muted-foreground" style={{ fontWeight: 400 }}>
                (اختياري)
              </span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثال: ظروف طارئة، تعارض في المواعيد..."
              rows={3}
              className="w-full px-4 py-3 border border-border rounded-xl bg-input-background text-foreground outline-none focus:border-red-300 focus:ring-2 focus:ring-red-50 resize-none transition-all placeholder:text-muted-foreground"
              style={{ fontSize: '13px' }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-border text-muted-foreground rounded-xl hover:bg-accent transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              تراجع
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="flex-1 py-3 text-white rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
              style={{
                background: confirming ? '#dc2626aa' : 'linear-gradient(135deg,#b91c1c,#dc2626)',
                fontSize: '14px',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(220,38,38,0.25)',
              }}
            >
              <XCircle className="w-4 h-4" />
              {confirming ? 'جارٍ الإلغاء...' : 'تأكيد الإلغاء'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
