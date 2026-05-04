import { useState } from 'react';
import { XCircle, X, CalendarDays, Clock, User, Megaphone, AlertTriangle } from 'lucide-react';
import { Slot15 } from '../../data/mockData';
import { campaigns } from '../../data/mockData';

interface CancelModalProps {
  slot: Slot15;
  doctorName: string;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export function CancelModal({ slot, doctorName, onConfirm, onClose }: CancelModalProps) {
  const [reason, setReason] = useState('');
  const [confirming, setConfirming] = useState(false);

  const campaign = slot.campaignId ? campaigns.find(c => c.id === slot.campaignId) : null;

  const handleConfirm = () => {
    setConfirming(true);
    setTimeout(() => {
      onConfirm(reason);
      onClose();
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-gray-900" style={{ fontSize: '16px', fontWeight: 800 }}>إلغاء الموعد</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">

          {/* Warning */}
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700" style={{ fontSize: '12px', lineHeight: '1.6' }}>
              سيتم إلغاء هذا الموعد فوراً وإرسال إشعار تلقائي للمتبرع. لا يمكن التراجع عن هذا الإجراء.
            </p>
          </div>

          {/* Appointment summary */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-400" style={{ fontSize: '11px' }}>المتبرع</p>
                <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>{slot.donorName}</p>
              </div>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-400" style={{ fontSize: '11px' }}>التاريخ</p>
                  <p className="text-gray-700 font-mono" style={{ fontSize: '13px', fontWeight: 600 }}>{slot.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-400" style={{ fontSize: '11px' }}>الوقت</p>
                  <p className="text-gray-700 font-mono" style={{ fontSize: '13px', fontWeight: 600 }}>{slot.time}</p>
                </div>
              </div>
            </div>
            {campaign && (
              <>
                <div className="h-px bg-gray-200" />
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="text-gray-400" style={{ fontSize: '11px' }}>الحملة</p>
                    <p className="text-purple-700" style={{ fontSize: '13px', fontWeight: 600 }}>{campaign.title}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Doctor */}
          <div className="flex items-center justify-between px-1">
            <span className="text-gray-500" style={{ fontSize: '12px' }}>يُلغى بواسطة</span>
            <span className="text-gray-800" style={{ fontSize: '13px', fontWeight: 700 }}>{doctorName}</span>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-gray-700 mb-1.5" style={{ fontSize: '13px', fontWeight: 600 }}>
              سبب الإلغاء <span className="text-gray-400" style={{ fontWeight: 400 }}>(اختياري)</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="مثال: ظروف طارئة، تعارض في المواعيد..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-50 resize-none transition-all"
              style={{ fontSize: '13px' }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              تراجع
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="flex-1 py-3 text-white rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ background: confirming ? '#dc2626aa' : 'linear-gradient(135deg,#b91c1c,#dc2626)', fontSize: '14px', fontWeight: 700, boxShadow: '0 4px 12px rgba(220,38,38,0.25)' }}
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
