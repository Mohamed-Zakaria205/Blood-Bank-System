import { Bell, Zap, Send, Smartphone } from 'lucide-react';
import type { NotifModal } from './eligibilityConstants';

interface NotifyDonorModalProps {
  modal: NotifModal;
  onSend: () => void;
  onCancel: () => void;
}

export default function NotifyDonorModal({ modal, onSend, onCancel }: NotifyDonorModalProps) {
  const isEmergency = modal.type === 'emergency';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div
          className={`p-5 border-b ${isEmergency ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${isEmergency ? 'bg-red-100' : 'bg-green-100'}`}
            >
              {isEmergency ? (
                <Zap className="w-6 h-6 text-red-600" />
              ) : (
                <Bell className="w-6 h-6 text-green-600" />
              )}
            </div>
            <div>
              <h3 className="text-foreground" style={{ fontSize: '17px', fontWeight: 700 }}>
                {isEmergency ? 'إشعار طارئ' : 'إشعار جاهزية للتبرع'}
              </h3>
              <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
                {modal.donor.name}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Recipient info */}
          <div className="p-3 bg-muted/40 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
                المتبرع
              </span>
              <span className="text-foreground" style={{ fontSize: '13px', fontWeight: 600 }}>
                {modal.donor.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
                الفصيلة
              </span>
              <span
                className="px-2 py-0.5 bg-red-50 text-red-600 rounded"
                style={{ fontSize: '12px', fontWeight: 800 }}
              >
                {modal.donor.bloodType}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
                الهاتف
              </span>
              <span className="text-foreground font-mono" style={{ fontSize: '13px' }}>
                {modal.donor.phone}
              </span>
            </div>
          </div>

          {/* Message preview */}
          <div>
            <label
              className="block text-foreground mb-2"
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              محتوى الإشعار
            </label>
            <div className="p-3 bg-muted/40 border border-border rounded-xl">
              <p className="text-foreground" style={{ fontSize: '13px', lineHeight: '1.6' }}>
                {isEmergency
                  ? `🚨 طلب دم طارئ — بنك دم بني سويف\nفصيلة الدم: ${modal.donor.bloodType}\nيرجى التواصل فوراً على: 082-XXXXXXX`
                  : `💚 أنت الآن مؤهل للتبرع بالدم مجدداً!\nآخر تبرع: ${modal.donor.lastDonationDate ?? 'لم يتبرع'}\nاحجز موعدك عبر التطبيق أو تواصل معنا.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <Smartphone className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <p className="text-blue-600" style={{ fontSize: '12px' }}>
              سيُرسَل الإشعار للتطبيق والرسائل النصية
            </p>
          </div>
        </div>

        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onSend}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-white rounded-xl transition-all ${isEmergency ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            style={{ fontSize: '14px', fontWeight: 700 }}
          >
            <Send className="w-4 h-4" /> إرسال الإشعار
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-muted text-foreground rounded-xl hover:bg-muted"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
