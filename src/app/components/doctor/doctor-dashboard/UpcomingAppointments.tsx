import { CalendarDays, ArrowUpRight } from 'lucide-react';
import type { Slot15 } from '../../../types/appointment';

interface UpcomingAppointmentsProps {
  appointments: Slot15[];
  onViewAll: () => void;
  onRegister: (aptId: string) => void;
}

export default function UpcomingAppointments({
  appointments,
  onViewAll,
  onRegister,
}: UpcomingAppointmentsProps) {
  if (appointments.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-gray-900" style={{ fontSize: '15px', fontWeight: 700 }}>
              مواعيد اليوم القادمة
            </h2>
            <p className="text-gray-400" style={{ fontSize: '11px' }}>
              من التطبيق — {appointments.length} موعد محجوز
            </p>
          </div>
        </div>
        <button
          onClick={onViewAll}
          className="text-green-600 hover:text-green-700 flex items-center gap-1"
          style={{ fontSize: '13px', fontWeight: 600 }}
        >
          عرض الكل <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
      <div className="divide-y divide-gray-50">
        {appointments.map((apt) => (
          <div
            key={apt.id}
            className="flex items-center gap-4 px-5 py-3.5 hover:bg-green-50 cursor-pointer transition-all group"
            onClick={() => onRegister(apt.id)}
          >
            {/* Time */}
            <div className="flex-shrink-0 w-14 text-center">
              <span
                className="text-green-700 font-mono"
                style={{ fontSize: '14px', fontWeight: 800 }}
                dir="ltr"
              >
                {apt.time}
              </span>
            </div>
            {/* Donor info */}
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 truncate" style={{ fontSize: '13px', fontWeight: 600 }}>
                {apt.donorName}
              </p>
              <p className="text-gray-400 font-mono" style={{ fontSize: '11px' }}>
                {apt.donorNationalId?.slice(0, 10)}...
              </p>
            </div>
            {/* Blood type + status */}
            <div className="hidden sm:flex items-center gap-2">
              {apt.donorBloodType && (
                <span
                  className="px-2 py-0.5 bg-red-50 border border-red-100 text-red-600 rounded-full"
                  style={{ fontSize: '11px', fontWeight: 700 }}
                >
                  {apt.donorBloodType}
                </span>
              )}
              <span
                className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full"
                style={{ fontSize: '11px', fontWeight: 700 }}
              >
                محجوز
              </span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
