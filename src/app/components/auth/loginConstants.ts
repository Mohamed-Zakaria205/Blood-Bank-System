// ═══════════════════════════════════════════════════════════
// Login page — shared constants, schema & helpers
// ═══════════════════════════════════════════════════════════
import {
  ShieldCheck,
  Stethoscope,
  FlaskConical,
  Package,
  Activity,
  Users,
  TestTube2,
  Shield,
} from 'lucide-react';
import { z } from 'zod';
import type { UserRole } from '../../types/auth';

// ── Zod validation schema ──────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'يرجى إدخال البريد الإلكتروني')
    .email('يرجى إدخال بريد إلكتروني صحيح'),
  password: z.string().min(1, 'يرجى إدخال كلمة المرور'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ── Demo account descriptors ───────────────────────────────
export interface DemoAccount {
  role: UserRole;
  label: string;
  desc: string;
  sublabel: string;
  email: string;
  password: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  accent: string;
  light: string;
  border: string;
  textColor: string;
}

export const demoAccounts: DemoAccount[] = [
  {
    role: 'admin',
    label: 'المدير العام',
    desc: 'إدارة النظام والتقارير',
    sublabel: 'admin123',
    email: 'admin@bloodlink.benisuef.eg',
    password: 'admin123',
    icon: ShieldCheck,
    accent: '#15803d',
    light: '#f0fdf4',
    border: '#bbf7d0',
    textColor: '#15803d',
  },
  {
    role: 'doctor',
    label: 'الطبيب',
    desc: 'تسجيل المتبرعين والحملات',
    sublabel: 'doctor123',
    email: 'dr.ahmed.hassan@bloodlink.benisuef.eg',
    password: 'doctor123',
    icon: Stethoscope,
    accent: '#0369a1',
    light: '#f0f9ff',
    border: '#bae6fd',
    textColor: '#0369a1',
  },
  {
    role: 'lab',
    label: 'طبيب التحاليل',
    desc: 'فحص العينات وإدخال النتائج',
    sublabel: 'lab123',
    email: 'lab.yasmin.hossam@bloodlink.benisuef.eg',
    password: 'lab123',
    icon: FlaskConical,
    accent: '#7c3aed',
    light: '#faf5ff',
    border: '#ddd6fe',
    textColor: '#7c3aed',
  },
  {
    role: 'inventory',
    label: 'أمين المخزون',
    desc: 'إدارة حقائب الدم والمخزون',
    sublabel: 'inventory123',
    email: 'inv.nadia.fathi@bloodlink.benisuef.eg',
    password: 'inventory123',
    icon: Package,
    accent: '#b45309',
    light: '#fffbeb',
    border: '#fde68a',
    textColor: '#b45309',
  },
];

// ── System stats shown on the brand panel ──────────────────
export const systemStats = [
  { icon: Activity, value: '190+', label: 'وحدة دم متاحة' },
  { icon: Users, value: '10', label: 'متبرع نشط' },
  { icon: TestTube2, value: '4', label: 'فحوصات معيارية' },
  { icon: Shield, value: '4', label: 'أدوار النظام' },
];

// ── Role → dashboard destination mapping ───────────────────
export function getRoleDashboardPath(role: string): string {
  switch (role) {
    case 'admin':     return '/admin';
    case 'lab':       return '/lab';
    case 'inventory': return '/inventory';
    default:          return '/doctor';
  }
}
