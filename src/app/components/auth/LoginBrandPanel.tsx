// ═══════════════════════════════════════════════════════════
// LoginBrandPanel — the green left panel with branding,
// role descriptions, and system stats (desktop only).
// ═══════════════════════════════════════════════════════════
import { Droplet } from 'lucide-react';
import { systemRoles, systemStats } from './loginConstants';

export default function LoginBrandPanel() {
  return (
    <div
      className="hidden lg:flex lg:w-[44%] flex-col relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #14532d 0%, #166534 35%, #15803d 70%, #16a34a 100%)',
      }}
    >
      {/* Dot grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Decorative circles */}
      <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full border border-white/10" />
      <div className="absolute -bottom-24 -right-24 w-[420px] h-[420px] rounded-full border border-white/8" />

      <div className="relative z-10 flex flex-col h-full p-10">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/20"
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Droplet className="w-7 h-7 text-white" />
          </div>
          <div>
            <p
              style={{
                fontSize: '24px',
                fontWeight: 800,
                color: 'white',
                letterSpacing: '-0.3px',
              }}
            >
              BloodLink
            </p>
            <p style={{ fontSize: '12px', color: '#86efac' }}>نظام إدارة بنك الدم</p>
          </div>
        </div>

        {/* Headline */}
        <div className="flex-1 flex flex-col justify-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 mb-5 w-fit"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#bbf7d0' }}>
              محافظة بني سويف
            </span>
          </div>

          <h2
            style={{
              fontSize: '38px',
              fontWeight: 800,
              lineHeight: '1.25',
              color: 'white',
              marginBottom: '14px',
            }}
          >
            منصة طبية
            <br />
            <span style={{ color: '#86efac' }}>متكاملة للدم</span>
          </h2>
          <p
            style={{
              fontSize: '15px',
              lineHeight: '1.7',
              color: '#bbf7d0',
              maxWidth: '360px',
              marginBottom: '36px',
            }}
          >
            نظام داخلي متكامل يربط جميع أقسام بنك الدم بكفاءة طبية عالية
          </p>

          {/* 4 Roles list */}
          <div className="space-y-2.5 mb-10">
            {systemRoles.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.10)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: 'white',
                    }}
                  >
                    {label}
                  </p>
                  <p style={{ fontSize: '11px', color: '#86efac' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2">
            {systemStats.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="text-center p-3 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.10)',
                }}
              >
                <Icon className="w-4 h-4 text-green-300 mx-auto mb-1" />
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: 'white',
                  }}
                >
                  {value}
                </div>
                <div
                  style={{
                    fontSize: '9px',
                    color: '#86efac',
                    lineHeight: '1.3',
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p
          style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.4)',
            marginTop: '24px',
          }}
        >
          BloodLink © 2025 — محافظة بني سويف
        </p>
      </div>
    </div>
  );
}
