// ═══════════════════════════════════════════════════════════
// DemoAccountPicker — 2×2 grid of role cards for quick login
// (dev-only convenience — guarded by the parent via DEV flag)
// ═══════════════════════════════════════════════════════════
import type { DemoAccount } from './loginConstants';

interface DemoAccountPickerProps {
  accounts: DemoAccount[];
  activeRole: DemoAccount | null;
  onSelect: (account: DemoAccount) => void;
}

export default function DemoAccountPicker({
  accounts,
  activeRole,
  onSelect,
}: DemoAccountPickerProps) {
  return (
    <div className="mb-5">
      <p
        style={{
          fontSize: '12px',
          fontWeight: 600,
          color: '#6b7280',
          marginBottom: '8px',
        }}
      >
        🔑 اختر دوراً للدخول السريع:
      </p>
      <div className="grid grid-cols-2 gap-2">
        {accounts.map((acc) => {
          const Icon = acc.icon;
          const isActive = activeRole?.role === acc.role;
          return (
            <button
              key={acc.role}
              type="button"
              onClick={() => onSelect(acc)}
              className="relative text-right p-3 rounded-xl border-2 transition-all duration-200 overflow-hidden"
              style={{
                background: isActive ? acc.light : '#ffffff',
                borderColor: isActive ? acc.accent : '#e5e7eb',
                boxShadow: isActive
                  ? `0 0 0 3px ${acc.accent}15, 0 2px 8px rgba(0,0,0,0.05)`
                  : '0 1px 3px rgba(0,0,0,0.04)',
                transform: isActive ? 'translateY(-1px)' : '',
              }}
            >
              {/* Top accent line */}
              {isActive && (
                <div
                  className="absolute inset-x-0 top-0 h-0.5 rounded-t-xl"
                  style={{ background: acc.accent }}
                />
              )}

              <div className="flex items-center gap-2.5">
                {/* Icon */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: isActive ? acc.accent : '#f3f4f6',
                    boxShadow: isActive ? `0 3px 8px ${acc.accent}35` : 'none',
                  }}
                >
                  <Icon
                    className="w-4 h-4"
                    style={{ color: isActive ? 'white' : '#9ca3af' }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Label */}
                  <p
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: isActive ? acc.accent : '#374151',
                      marginBottom: '1px',
                    }}
                  >
                    {acc.label}
                  </p>
                  {/* Password badge */}
                  <span
                    className="inline-block px-1.5 py-0 rounded"
                    style={{
                      fontSize: '9px',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      background: isActive ? `${acc.accent}14` : '#f3f4f6',
                      color: isActive ? acc.accent : '#9ca3af',
                      border: `1px solid ${isActive ? acc.accent + '25' : '#e5e7eb'}`,
                    }}
                  >
                    {acc.sublabel}
                  </span>
                </div>

                {/* Active check */}
                {isActive && (
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: acc.accent }}
                  >
                    <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
