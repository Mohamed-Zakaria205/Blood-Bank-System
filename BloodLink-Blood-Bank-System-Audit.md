## User

### **The Prompt (English):**

**Role:** Senior Frontend Architect & UI/UX Specialist.

**Task:** Perform a deep-dive audit of my "BloodLink" (Blood Bank Management System) React project.

---

### **Current Context:**

- **Completed Architecture:** I have implemented a central API layer using Axios with JWT interceptors.

- **Data Flow:** I am using React Query for all server-state, with a `USE_MOCK` toggle in each service file to switch between `mockData.ts` and real API endpoints.

- **Types:** Extracted all interfaces into a dedicated `types/` directory.

---

### **Audit Requirements:**

Please analyze the project structure and provided code for the following:

1. **UI/UX Polish:**  
   Identify missing user experience patterns. Check for the absence of "Skeleton Screens" during loading, "Error Boundaries" for failed fetches, and "Empty States" for tables.

2. **TypeScript Integrity:**  
   Review the current `types/` directory. Are there overlaps between Entities (Database objects) and DTOs (Request/Response objects)? Identify if sensitive fields (like passwords) are leaking into frontend types.

3. **Component Refactor Status:**  
   Every component must be decoupled from `mockData.ts`. Identify any remaining components that still import static arrays instead of using my new React Query hooks.

4. **Form Optimization:**  
   Evaluate if the forms are ready for `useMutation`. Check if they use proper validation (e.g., `react-hook-form`) or if they are still using manual state logic.

5. **Integration Readiness Checklist:**  
   What specific "blind spots" exist before I flip `USE_MOCK` to `false`? Focus on CORS configuration, Environment Variables (`.env`), and Token refresh logic.

---

### **Output Format:**

- **Critical Issues:** A list of "Show-stoppers" that will break during real backend integration.

- **UI/UX Enhancements:** Suggestions for better visual feedback.

- **Type Safety Fixes:** Necessary changes to the interface structures.

- **Action Plan:** A prioritized list of tasks

## Assistant

<thinking>
The user wants a comprehensive audit of their Blood Bank Management System React project. Let me start by exploring the project structure to understand what's there.
</thinking>

Let me do a thorough exploration of your project before writing the audit report.

**Tool Call: List the `D:\Graduation!!!\Blood-Bank-System` directory's contents**
Status: Completed

# Folders:

Blood-Bank-System\guidelines
Blood-Bank-System\node_modules
Blood-Bank-System\src

# Files:

Blood-Bank-System\.gitignore
Blood-Bank-System\ATTRIBUTIONS.md
Blood-Bank-System\README.md
Blood-Bank-System\default_shadcn_theme.css
Blood-Bank-System\index.html
Blood-Bank-System\package-lock.json
Blood-Bank-System\package.json
Blood-Bank-System\pnpm-workspace.yaml
Blood-Bank-System\postcss.config.mjs
Blood-Bank-System\vite.config.ts

**Tool Call: List the `D:\Graduation!!!\Blood-Bank-System\src` directory's contents**
Status: Completed

# Folders:

Blood-Bank-System\src\app
Blood-Bank-System\src\imports
Blood-Bank-System\src\styles

# Files:

Blood-Bank-System\src\main.tsx

**Tool Call: Read file `package.json`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\package.json
{
  "name": "@figma/my-make-file",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "build": "vite build",
    "dev": "vite"
  },
  "dependencies": {
    "@emotion/react": "11.14.0",
    "@emotion/styled": "11.14.1",
    "@mui/icons-material": "7.3.5",
    "@mui/material": "7.3.5",
    "@popperjs/core": "2.11.8",
    "@radix-ui/react-accordion": "1.2.3",
    "@radix-ui/react-alert-dialog": "1.1.6",
    "@radix-ui/react-aspect-ratio": "1.1.2",
    "@radix-ui/react-avatar": "1.1.3",
    "@radix-ui/react-checkbox": "1.1.4",
    "@radix-ui/react-collapsible": "1.1.3",
    "@radix-ui/react-context-menu": "2.2.6",
    "@radix-ui/react-dialog": "1.1.6",
    "@radix-ui/react-dropdown-menu": "2.1.6",
    "@radix-ui/react-hover-card": "1.1.6",
    "@radix-ui/react-label": "2.1.2",
    "@radix-ui/react-menubar": "1.1.6",
    "@radix-ui/react-navigation-menu": "1.2.5",
    "@radix-ui/react-popover": "1.1.6",
    "@radix-ui/react-progress": "1.1.2",
    "@radix-ui/react-radio-group": "1.2.3",
    "@radix-ui/react-scroll-area": "1.2.3",
    "@radix-ui/react-select": "2.1.6",
    "@radix-ui/react-separator": "1.1.2",
    "@radix-ui/react-slider": "1.2.3",
    "@radix-ui/react-slot": "1.1.2",
    "@radix-ui/react-switch": "1.1.3",
    "@radix-ui/react-tabs": "1.1.3",
    "@radix-ui/react-toggle": "1.1.2",
    "@radix-ui/react-toggle-group": "1.1.2",
    "@radix-ui/react-tooltip": "1.1.8",
    "@tanstack/react-query": "^5.100.9",
    "@tanstack/react-query-devtools": "^5.100.9",
    "axios": "^1.16.0",
    "canvas-confetti": "1.9.4",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "cmdk": "1.1.1",
    "date-fns": "3.6.0",
    "embla-carousel-react": "8.6.0",
    "input-otp": "1.4.2",
    "lucide-react": "0.487.0",
    "motion": "12.23.24",
    "next-themes": "0.4.6",
    "react-day-picker": "8.10.1",
    "react-dnd": "16.0.1",
    "react-dnd-html5-backend": "16.0.1",
    "react-hook-form": "7.55.0",
    "react-popper": "2.3.0",
    "react-resizable-panels": "2.1.7",
    "react-responsive-masonry": "2.7.1",
    "react-router": "7.13.0",
    "react-slick": "0.31.0",
    "recharts": "2.15.2",
    "sonner": "2.0.3",
    "tailwind-merge": "3.2.0",
    "tw-animate-css": "1.3.8",
    "vaul": "1.1.2"
  },
  "devDependencies": {
    "@tailwindcss/vite": "4.1.12",
    "@vitejs/plugin-react": "4.7.0",
    "tailwindcss": "4.1.12",
    "vite": "6.3.5"
  },
  "peerDependencies": {
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": true
    },
    "react-dom": {
      "optional": true
    }
  },
  "pnpm": {
    "overrides": {
      "vite": "6.3.5"
    }
  }
}

```

**Tool Call: List the `D:\Graduation!!!\Blood-Bank-System\src\app` directory's contents**
Status: Completed

# Folders:

Blood-Bank-System\src\app\api
Blood-Bank-System\src\app\components
Blood-Bank-System\src\app\contexts
Blood-Bank-System\src\app\data
Blood-Bank-System\src\app\hooks
Blood-Bank-System\src\app\types

# Files:

Blood-Bank-System\src\app\App.tsx
Blood-Bank-System\src\app\routes.tsx

**Tool Call: List the `D:\Graduation!!!\Blood-Bank-System\src\app\api` directory's contents**
Status: Completed

# Files:

Blood-Bank-System\src\app\api\appointments.ts
Blood-Bank-System\src\app\api\auth.ts
Blood-Bank-System\src\app\api\campaigns.ts
Blood-Bank-System\src\app\api\client.ts
Blood-Bank-System\src\app\api\donors.ts
Blood-Bank-System\src\app\api\inventory.ts
Blood-Bank-System\src\app\api\lab.ts
Blood-Bank-System\src\app\api\staff.ts

**Tool Call: List the `D:\Graduation!!!\Blood-Bank-System\src\app\types` directory's contents**
Status: Completed

# Files:

Blood-Bank-System\src\app\types\appointment.ts
Blood-Bank-System\src\app\types\auth.ts
Blood-Bank-System\src\app\types\campaign.ts
Blood-Bank-System\src\app\types\common.ts
Blood-Bank-System\src\app\types\donor.ts
Blood-Bank-System\src\app\types\index.ts
Blood-Bank-System\src\app\types\inventory.ts
Blood-Bank-System\src\app\types\lab.ts

**Tool Call: List the `D:\Graduation!!!\Blood-Bank-System\src\app\hooks` directory's contents**
Status: Completed

# Files:

Blood-Bank-System\src\app\hooks\useAppointments.ts
Blood-Bank-System\src\app\hooks\useCampaigns.ts
Blood-Bank-System\src\app\hooks\useDonors.ts
Blood-Bank-System\src\app\hooks\useInventory.ts
Blood-Bank-System\src\app\hooks\useLabTests.ts
Blood-Bank-System\src\app\hooks\useStaff.ts

**Tool Call: List the `D:\Graduation!!!\Blood-Bank-System\src\app\data` directory's contents**
Status: Completed

# Files:

Blood-Bank-System\src\app\data\mockData.ts

**Tool Call: List the `D:\Graduation!!!\Blood-Bank-System\src\app\components` directory's contents**
Status: Completed

# Folders:

Blood-Bank-System\src\app\components\admin
Blood-Bank-System\src\app\components\auth
Blood-Bank-System\src\app\components\doctor
Blood-Bank-System\src\app\components\figma
Blood-Bank-System\src\app\components\inventory
Blood-Bank-System\src\app\components\lab
Blood-Bank-System\src\app\components\layout
Blood-Bank-System\src\app\components\mobile
Blood-Bank-System\src\app\components\shared
Blood-Bank-System\src\app\components\ui

**Tool Call: List the `D:\Graduation!!!\Blood-Bank-System\src\app\contexts` directory's contents**
Status: Completed

# Files:

Blood-Bank-System\src\app\contexts\AppointmentContext.tsx
Blood-Bank-System\src\app\contexts\AuthContext.tsx
Blood-Bank-System\src\app\contexts\InventoryContext.tsx
Blood-Bank-System\src\app\contexts\ThemeContext.tsx

**Tool Call: List the `D:\Graduation!!!\Blood-Bank-System\src\app\components\admin` directory's contents**
Status: Completed

# Files:

Blood-Bank-System\src\app\components\admin\AdminAnalytics.tsx
Blood-Bank-System\src\app\components\admin\AdminCampaigns.tsx
Blood-Bank-System\src\app\components\admin\AdminDashboard.tsx
Blood-Bank-System\src\app\components\admin\AdminDonors.tsx
Blood-Bank-System\src\app\components\admin\AdminEmergency.tsx
Blood-Bank-System\src\app\components\admin\AdminInventory.tsx
Blood-Bank-System\src\app\components\admin\AdminInventoryAlerts.tsx
Blood-Bank-System\src\app\components\admin\AdminReports.tsx
Blood-Bank-System\src\app\components\admin\AdminSettings.tsx
Blood-Bank-System\src\app\components\admin\AdminStaff.tsx
Blood-Bank-System\src\app\components\admin\AdminUsers.tsx

**Tool Call: List the `D:\Graduation!!!\Blood-Bank-System\src\app\components\auth` directory's contents**
Status: Completed

# Files:

Blood-Bank-System\src\app\components\auth\LoginPage.tsx

**Tool Call: List the `D:\Graduation!!!\Blood-Bank-System\src\app\components\shared` directory's contents**
Status: Completed

# Files:

Blood-Bank-System\src\app\components\shared\CancelModal.tsx
Blood-Bank-System\src\app\components\shared\LoadingSkeleton.tsx

**Tool Call: List the `D:\Graduation!!!\Blood-Bank-System\src\app\components\doctor` directory's contents**
Status: Completed

# Files:

Blood-Bank-System\src\app\components\doctor\DoctorAppointments.tsx
Blood-Bank-System\src\app\components\doctor\DoctorCampaigns.tsx
Blood-Bank-System\src\app\components\doctor\DoctorDashboard.tsx
Blood-Bank-System\src\app\components\doctor\DoctorDonors.tsx
Blood-Bank-System\src\app\components\doctor\DoctorEligibility.tsx
Blood-Bank-System\src\app\components\doctor\DonorRegistrationForm.tsx

**Tool Call: List the `D:\Graduation!!!\Blood-Bank-System\src\app\components\lab` directory's contents**
Status: Completed

# Files:

Blood-Bank-System\src\app\components\lab\LabDashboard.tsx
Blood-Bank-System\src\app\components\lab\LabResults.tsx

**Tool Call: List the `D:\Graduation!!!\Blood-Bank-System\src\app\components\inventory` directory's contents**
Status: Completed

# Files:

Blood-Bank-System\src\app\components\inventory\InventoryBags.tsx
Blood-Bank-System\src\app\components\inventory\InventoryDashboard.tsx
Blood-Bank-System\src\app\components\inventory\InventoryDisposal.tsx
Blood-Bank-System\src\app\components\inventory\InventoryHistory.tsx
Blood-Bank-System\src\app\components\inventory\InventoryRequests.tsx
Blood-Bank-System\src\app\components\inventory\InventoryTransactions.tsx

**Tool Call: List the `D:\Graduation!!!\Blood-Bank-System\src\app\components\layout` directory's contents**
Status: Completed

# Files:

Blood-Bank-System\src\app\components\layout\AdminLayout.tsx
Blood-Bank-System\src\app\components\layout\DoctorLayout.tsx
Blood-Bank-System\src\app\components\layout\InventoryLayout.tsx
Blood-Bank-System\src\app\components\layout\LabLayout.tsx
Blood-Bank-System\src\app\components\layout\NotificationDropdown.tsx

## Assistant

Now let me read all the key files in parallel:

**Tool Call: Read file `src\app\api\client.ts`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\api\client.ts
// ═══════════════════════════════════════════════════════════
// Axios client — single instance used by all API calls
// ═══════════════════════════════════════════════════════════
import axios from "axios";

const apiClient = axios.create({
  baseURL:
    (import.meta as any).env?.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15_000, // 15 s
});

// ── Request interceptor: attach JWT token ──────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("bloodlink_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: handle 401 (session expired) ─────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stored credentials and force re-login
      localStorage.removeItem("bloodlink_token");
      localStorage.removeItem("bloodlink_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default apiClient;

```

**Tool Call: Read file `src\app\api\auth.ts`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\api\auth.ts
// ═══════════════════════════════════════════════════════════
// Auth API service — login / logout / token helpers
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type { LoginRequest, LoginResponse, User } from '../types/auth';

// ── Mock mode flag ─────────────────────────────────────────
// When the backend is not yet available, the app falls back to
// the hardcoded mock users so the UI remains fully usable.
// Flip this to `false` once your backend's /auth/login is live.
const USE_MOCK = true;

// ── Mock users (kept ONLY in this file, not imported elsewhere) ─
const MOCK_USERS: (User & { password: string })[] = [
  {
    id: 'USR-001', name: 'د. محمد إبراهيم السيد', email: 'admin@bloodlink.benisuef.eg',
    password: 'admin123', role: 'admin', age: 52, nationalId: '27301050001111',
    phone: '01012345678', address: 'شارع النيل، أمام المحافظة', city: 'بني سويف',
    status: 'active', createdAt: '2024-01-01',
  },
  {
    id: 'USR-002', name: 'د. أحمد حسن علي', email: 'dr.ahmed.hassan@bloodlink.benisuef.eg',
    password: 'doctor123', role: 'doctor', age: 38, nationalId: '28601020002222',
    phone: '01123456789', address: 'شارع الجمهورية، الواسطى', city: 'الواسطى',
    status: 'active', createdAt: '2024-02-15',
  },
  {
    id: 'USR-003', name: 'د. سارة محمود رضا', email: 'dr.sara.mahmoud@bloodlink.benisuef.eg',
    password: 'doctor123', role: 'doctor', age: 34, nationalId: '29101030003333',
    phone: '01234567890', address: 'شارع الطبراوي، ناصر', city: 'ناصر',
    status: 'active', createdAt: '2024-03-10',
  },
  {
    id: 'USR-004', name: 'د. خالد عبد الرحمن', email: 'dr.khaled.abdulrahman@bloodlink.benisuef.eg',
    password: 'doctor123', role: 'doctor', age: 41, nationalId: '28401040004444',
    phone: '01098765432', address: 'شارع السكة الحديد، ببا', city: 'ببا',
    status: 'active', createdAt: '2024-04-05',
  },
  {
    id: 'USR-005', name: 'د. هنا طارق مصطفى', email: 'dr.hana.tarek@bloodlink.benisuef.eg',
    password: 'doctor123', role: 'doctor', age: 29, nationalId: '29601050005555',
    phone: '01555443322', address: 'شارع جمال عبد الناصر، الفشن', city: 'الفشن',
    status: 'inactive', createdAt: '2024-06-20',
  },
  {
    id: 'USR-006', name: 'د. ياسمين حسام نور', email: 'lab.yasmin.hossam@bloodlink.benisuef.eg',
    password: 'lab123', role: 'lab', age: 31, nationalId: '29401060006666',
    phone: '01677889900', address: 'شارع الوحدة، بني سويف', city: 'بني سويف',
    status: 'active', createdAt: '2024-05-12',
  },
  {
    id: 'USR-007', name: 'د. كريم وليد سعد', email: 'lab.karim.walid@bloodlink.benisuef.eg',
    password: 'lab123', role: 'lab', age: 36, nationalId: '28901070007777',
    phone: '01011223344', address: 'شارع الملك، الواسطى', city: 'الواسطى',
    status: 'active', createdAt: '2024-07-01',
  },
  {
    id: 'USR-008', name: 'أ. نادية فتحي حسين', email: 'inv.nadia.fathi@bloodlink.benisuef.eg',
    password: 'inventory123', role: 'inventory', age: 40, nationalId: '28501080008888',
    phone: '01022334455', address: 'شارع بورسعيد، بني سويف', city: 'بني سويف',
    status: 'active', createdAt: '2024-08-01',
  },
];

/**
 * Authenticate a user.
 * In mock mode: checks against MOCK_USERS above.
 * In real mode: POSTs to /auth/login.
 */
export async function loginApi(credentials: LoginRequest): Promise<LoginResponse> {
  if (USE_MOCK) {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 500));

    const found = MOCK_USERS.find(
      (u) => u.email === credentials.email && u.password === credentials.password,
    );

    if (!found) {
      throw { response: { status: 422, data: { message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' } } };
    }
    if (found.status === 'inactive') {
      throw { response: { status: 403, data: { message: 'هذا الحساب معطل. يرجى التواصل مع المدير' } } };
    }

    // Strip password before returning
    const { password: _, ...user } = found;
    return { token: `mock-jwt-${user.id}`, user };
  }

  // ── Real API call ──
  const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials);
  return data;
}

```

**Tool Call: Read file `src\app\api\donors.ts`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\api\donors.ts
// ═══════════════════════════════════════════════════════════
// Donors API service
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type { Donor, CreateDonorRequest } from '../types/donor';
import { donors as MOCK_DONORS } from '../data/mockData';

const USE_MOCK = true;

export async function fetchDonors(): Promise<Donor[]> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    return MOCK_DONORS;
  }
  const { data } = await apiClient.get<Donor[]>('/donors');
  return data;
}

export async function fetchDonorById(id: string): Promise<Donor> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 200));
    const donor = MOCK_DONORS.find(d => d.id === id);
    if (!donor) throw { response: { status: 404, data: { message: 'المتبرع غير موجود' } } };
    return donor;
  }
  const { data } = await apiClient.get<Donor>(`/donors/${id}`);
  return data;
}

export async function createDonor(payload: CreateDonorRequest): Promise<Donor> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 400));
    const newDonor: Donor = {
      ...payload,
      id: `DON-${Date.now()}`,
      donorCode: `DNR-2025-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    };
    return newDonor;
  }
  const { data } = await apiClient.post<Donor>('/donors', payload);
  return data;
}

```

**Tool Call: Read file `src\app\types\index.ts`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\types\index.ts
// ═══════════════════════════════════════════════════════════
// Barrel re-export — import anything from '@/types' or '../types'
// ═══════════════════════════════════════════════════════════

export * from './common';
export * from './auth';
export * from './donor';
export * from './campaign';
export * from './inventory';
export * from './lab';
export * from './appointment';

```

**Tool Call: Read file `src\app\types\auth.ts`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\types\auth.ts
// ═══════════════════════════════════════════════════════════
// Auth types — Login, token, user session
// ═══════════════════════════════════════════════════════════

export type UserRole = 'admin' | 'doctor' | 'lab' | 'inventory';

/**
 * The user object returned by the backend after login.
 * NOTE: No `password` field — the backend must never send it.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  age: number;
  nationalId: string;
  phone: string;
  address: string;
  city: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

/** POST /auth/login — request body */
export interface LoginRequest {
  email: string;
  password: string;
}

/** POST /auth/login — response body */
export interface LoginResponse {
  token: string;
  user: User;
}

```

**Tool Call: Read file `src\app\types\donor.ts`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\types\donor.ts
// ═══════════════════════════════════════════════════════════
// Donor types
// ═══════════════════════════════════════════════════════════
import type { BloodType, DonationType, DonorStatus } from './common';

export interface MedicalQuestions {
  feelingWell: boolean;
  recentMedications: boolean;
  chronicDiseases: boolean;
  hadSurgery: boolean;
  anemia: boolean;
  infectiousDiseases: boolean;
  receivedBlood: boolean;
  pregnant: boolean;
}

/** Full donor entity (returned by the backend) */
export interface Donor {
  id: string;
  donorCode: string;
  name: string;
  gender: 'male' | 'female';
  age: number;
  nationalId: string;
  phone: string;
  secondaryPhone?: string;
  email?: string;
  address: string;
  city: string;
  bloodType: BloodType;
  lastDonationDate?: string;
  donationType: DonationType;
  medicalQuestions: MedicalQuestions;
  diseases: string[];
  additionalData?: { weight?: number; height?: number; hemoglobin?: number; bloodPressure?: string };
  status: DonorStatus;
  registeredBy: string;
  registeredAt: string;
  source: 'walkin' | 'app' | 'campaign';
  campaignId?: string;
  campaignName?: string;
  deferredUntil?: string;
  donations?: number;
  points?: number;
}

/** POST /donors — request body (backend generates id & donorCode) */
export type CreateDonorRequest = Omit<Donor, 'id' | 'donorCode'>;

```

**Tool Call: Read file `src\app\types\common.ts`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\types\common.ts
// ═══════════════════════════════════════════════════════════
// Common / shared types & generic API wrappers
// ═══════════════════════════════════════════════════════════

/** Standard paginated response from the backend */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/** Standard single-item response from the backend */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/** Standardised API error shape */
export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

/** Re-usable literal unions */
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type DonationType = 'whole' | 'plasma' | 'platelets';
export type DonorStatus = 'eligible' | 'ineligible' | 'deferred';
export type CampaignStatus = 'active' | 'completed';
export type InventoryStatus = 'normal' | 'low' | 'critical';
export type BloodBagStatus = 'available' | 'reserved' | 'issued' | 'expired' | 'rejected' | 'disposed';
export type TransactionType = 'issue' | 'return' | 'disposal' | 'receive' | 'reserve';
export type RequestUrgency = 'normal' | 'urgent' | 'emergency';
export type RequestStatus = 'pending' | 'approved' | 'fulfilled' | 'rejected';
export type OutflowActionType = 'exported' | 'disposed';
export type DestinationType = 'hospital' | 'patient';

```

**Tool Call: Read file `src\app\types\inventory.ts`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\types\inventory.ts
// ═══════════════════════════════════════════════════════════
// Inventory types — blood bags, transactions, requests, outflow
// ═══════════════════════════════════════════════════════════
import type {
  BloodType, DonationType, BloodBagStatus, TransactionType,
  RequestUrgency, RequestStatus, InventoryStatus, OutflowActionType,
} from './common';

export interface BloodInventoryItem {
  type: BloodType;
  units: number;
  status: InventoryStatus;
  minRequired: number;
  lastUpdated: string;
}

export interface BloodBag {
  id: string;
  bagCode: string;
  bloodType: BloodType;
  donationType: DonationType;
  donorCode?: string;
  collectedDate: string;
  expiryDate: string;
  status: BloodBagStatus;
  volume: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  bagIds: string[];
  bagCodes: string[];
  bloodType: BloodType;
  quantity: number;
  timestamp: string;
  performedBy: string;
  performedByName: string;
  destination?: string;
  notes?: string;
  requestId?: string;
}

export interface HospitalRequest {
  id: string;
  hospitalName: string;
  bloodType: BloodType;
  quantity: number;
  urgency: RequestUrgency;
  requestedAt: string;
  status: RequestStatus;
  approvedBy?: string;
  fulfilledBy?: string;
  fulfilledAt?: string;
  notes?: string;
  bagIds?: string[];
}

export interface OutflowRecord {
  id: string;
  bagId: string;
  bagCode: string;
  bloodType: BloodType;
  donationType: DonationType;
  actionType: OutflowActionType;
  recipientName?: string;
  nationalId?: string;
  phone?: string;
  reason: string;
  disposalCategory?: string;
  notes?: string;
  performedBy: string;
  performedByName: string;
  timestamp: string;
}

export interface MonthlyStats {
  month: string;
  donations: number;
  newDonors: number;
  campaigns: number;
  issued?: number;
  wasted?: number;
}

```

**Tool Call: Read file `src\app\types\lab.ts`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\types\lab.ts
// ═══════════════════════════════════════════════════════════
// Lab types — tests, samples, results
// ═══════════════════════════════════════════════════════════
import type { BloodType, DonationType } from './common';

export interface LabTest {
  id: string;
  donorId: string;
  donorName: string;
  donorCode: string;
  bloodType: BloodType;
  donationType: DonationType;
  city: string;
  requestedAt: string;
  status: 'pending' | 'completed' | 'cancelled';
  result?: {
    confirmedBloodType: BloodType;
    hcv: 'negative' | 'positive';
    hbv: 'negative' | 'positive';
    syphilis: 'negative' | 'positive';
    hiv: 'negative' | 'positive';
    notes: string;
    suitable: boolean;
    completedAt: string;
    completedBy: string;
  };
}

export interface Sample {
  id: string;
  donorCode: string;
  donorName: string;
  bloodType: BloodType;
  donationType: DonationType;
  collectedDate: string;
  status: 'pending' | 'testing' | 'completed';
  priority: 'normal' | 'urgent';
  labDoctor?: string;
  city?: string;
}

export interface TestResult {
  id: string;
  sampleId: string;
  donorCode: string;
  donorName: string;
  bloodType: BloodType;
  confirmedBloodType: BloodType;
  hepatitisB: 'negative' | 'positive';
  hepatitisC: 'negative' | 'positive';
  syphilis: 'negative' | 'positive';
  hiv: 'negative' | 'positive';
  result: 'safe' | 'unsafe';
  labDoctor: string;
  date: string;
  notes?: string;
}

```

**Tool Call: Read file `src\app\types\appointment.ts`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\types\appointment.ts
// ═══════════════════════════════════════════════════════════
// Appointment types
// ═══════════════════════════════════════════════════════════
import type { BloodType, DonationType } from './common';

export interface AppointmentBooking {
  id: string;
  donorName: string;
  donorCode?: string;
  phone: string;
  bloodType?: BloodType;
  source: 'app' | 'manual';
  status: 'confirmed' | 'cancelled';
}

export interface AppointmentSlot {
  id: string;
  date: string;
  time: string;
  capacity: number;
  bookings: AppointmentBooking[];
  isDisabled: boolean;
  campaignId?: string;
}

export interface TimeSlot {
  time: string;
  status: 'available' | 'booked';
  donorName?: string;
  donorCode?: string;
}

export interface AppointmentDay {
  date: string;
  slots: TimeSlot[];
}

export type Slot15Status = 'available' | 'booked' | 'completed' | 'missed' | 'disabled' | 'cancelled';

export interface Slot15 {
  id: string;
  date: string;
  time: string;
  donorName?: string;
  donorCode?: string;
  donorNationalId?: string;
  donorPhone?: string;
  donorBloodType?: BloodType;
  donorGender?: 'male' | 'female';
  donorAge?: number;
  donorDistrict?: string;
  donorArea?: string;
  donationType?: DonationType;
  status: Slot15Status;
  campaignId?: string;
  notes?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancelledByName?: string;
  cancellationReason?: string;
}

```

**Tool Call: Read file `src\app\types\campaign.ts`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\types\campaign.ts
// ═══════════════════════════════════════════════════════════
// Campaign types
// ═══════════════════════════════════════════════════════════
import type { CampaignStatus } from './common';

export interface Campaign {
  id: string;
  title: string;
  location: string;
  city: string;
  date: string;
  endDate?: string;
  targetDonors: number;
  registeredDonors: number;
  status: CampaignStatus;
  createdBy: string;
  createdByName: string;
  description: string;
}

export type CreateCampaignRequest = Omit<Campaign, 'id'>;

```

**Tool Call: Read file `src\app\hooks\useDonors.ts`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\hooks\useDonors.ts
// ═══════════════════════════════════════════════════════════
// React Query hooks — Donors
// ═══════════════════════════════════════════════════════════
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDonors, fetchDonorById, createDonor } from '../api/donors';
import type { CreateDonorRequest } from '../types/donor';

/** Fetch all donors */
export function useDonors() {
  return useQuery({
    queryKey: ['donors'],
    queryFn: fetchDonors,
  });
}

/** Fetch a single donor by ID */
export function useDonor(id: string) {
  return useQuery({
    queryKey: ['donors', id],
    queryFn: () => fetchDonorById(id),
    enabled: !!id,
  });
}

/** Create a new donor — auto-invalidates the donors list */
export function useCreateDonor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDonorRequest) => createDonor(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['donors'] });
    },
  });
}

```

**Tool Call: Read file `src\app\hooks\useAppointments.ts`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\hooks\useAppointments.ts
// ═══════════════════════════════════════════════════════════
// React Query hooks — Appointments
// ═══════════════════════════════════════════════════════════
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAppointmentSlots, fetchSlot15Data, cancelAppointment,
} from '../api/appointments';

/** Fetch appointment slots (with bookings) */
export function useAppointmentSlots() {
  return useQuery({
    queryKey: ['appointment-slots'],
    queryFn: fetchAppointmentSlots,
  });
}

/** Fetch 15-min slot data (doctor view) */
export function useSlot15Data() {
  return useQuery({
    queryKey: ['slot15'],
    queryFn: fetchSlot15Data,
  });
}

/** Cancel an appointment slot */
export function useCancelAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slotId, reason }: { slotId: string; reason: string }) =>
      cancelAppointment(slotId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointment-slots'] });
      qc.invalidateQueries({ queryKey: ['slot15'] });
    },
  });
}

```

**Tool Call: Read file `src\app\hooks\useInventory.ts`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\hooks\useInventory.ts
// ═══════════════════════════════════════════════════════════
// React Query hooks — Inventory (bags, transactions, requests, outflow, stats)
// ═══════════════════════════════════════════════════════════
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchBloodBags, exportBags, disposeBag,
  fetchBloodInventory,
  fetchTransactions,
  fetchHospitalRequests, fulfillRequest,
  fetchOutflowRecords,
  fetchMonthlyStats,
} from '../api/inventory';

// ── Blood Bags ─────────────────────────────────────────────
export function useBloodBags() {
  return useQuery({
    queryKey: ['bags'],
    queryFn: fetchBloodBags,
  });
}

export function useExportBags() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bagIds, recipient }: {
      bagIds: string[];
      recipient: { recipientName: string; nationalId: string; phone?: string; reason: string };
    }) => exportBags(bagIds, recipient),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bags'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['outflow'] });
      qc.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useDisposeBag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bagId, reason }: { bagId: string; reason: string }) =>
      disposeBag(bagId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bags'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['outflow'] });
      qc.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

// ── Blood Inventory Summary ────────────────────────────────
export function useBloodInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: fetchBloodInventory,
  });
}

// ── Transactions ───────────────────────────────────────────
export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
  });
}

// ── Hospital Requests ──────────────────────────────────────
export function useHospitalRequests() {
  return useQuery({
    queryKey: ['requests'],
    queryFn: fetchHospitalRequests,
  });
}

export function useFulfillRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, bagIds }: { requestId: string; bagIds: string[] }) =>
      fulfillRequest(requestId, bagIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] });
      qc.invalidateQueries({ queryKey: ['bags'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

// ── Outflow Records ────────────────────────────────────────
export function useOutflowRecords() {
  return useQuery({
    queryKey: ['outflow'],
    queryFn: fetchOutflowRecords,
  });
}

// ── Monthly Stats ──────────────────────────────────────────
export function useMonthlyStats() {
  return useQuery({
    queryKey: ['monthly-stats'],
    queryFn: fetchMonthlyStats,
  });
}

```

**Tool Call: Read file `src\app\api\appointments.ts`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\api\appointments.ts
// ═══════════════════════════════════════════════════════════
// Appointments API service
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type { AppointmentSlot, Slot15 } from '../types/appointment';
import {
  appointmentSlots as MOCK_SLOTS,
  slot15Data as MOCK_SLOT15,
} from '../data/mockData';

const USE_MOCK = true;

export async function fetchAppointmentSlots(): Promise<AppointmentSlot[]> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    return MOCK_SLOTS;
  }
  const { data } = await apiClient.get<AppointmentSlot[]>('/appointments/slots');
  return data;
}

export async function fetchSlot15Data(): Promise<Slot15[]> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    return MOCK_SLOT15;
  }
  const { data } = await apiClient.get<Slot15[]>('/appointments/slot15');
  return data;
}

export async function cancelAppointment(slotId: string, reason: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 400));
    return;
  }
  await apiClient.post(`/appointments/slots/${slotId}/cancel`, { reason });
}

```

**Tool Call: Read file `src\app\api\campaigns.ts`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\api\campaigns.ts
// ═══════════════════════════════════════════════════════════
// Campaigns API service
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type { Campaign, CreateCampaignRequest } from '../types/campaign';
import { campaigns as MOCK_CAMPAIGNS } from '../data/mockData';

const USE_MOCK = true;

export async function fetchCampaigns(): Promise<Campaign[]> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    return MOCK_CAMPAIGNS;
  }
  const { data } = await apiClient.get<Campaign[]>('/campaigns');
  return data;
}

export async function createCampaign(payload: CreateCampaignRequest): Promise<Campaign> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 400));
    return { ...payload, id: `CAM-${Date.now()}` };
  }
  const { data } = await apiClient.post<Campaign>('/campaigns', payload);
  return data;
}

```

**Tool Call: Read file `src\app\api\inventory.ts`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\api\inventory.ts
// ═══════════════════════════════════════════════════════════
// Inventory API service — bags, transactions, requests, outflow, stats
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type {
  BloodBag, BloodInventoryItem, Transaction,
  HospitalRequest, OutflowRecord, MonthlyStats,
} from '../types/inventory';
import {
  bloodBags as MOCK_BAGS,
  bloodInventory as MOCK_INVENTORY,
  initialTransactions as MOCK_TRANSACTIONS,
  initialHospitalRequests as MOCK_REQUESTS,
  initialOutflowRecords as MOCK_OUTFLOW,
  monthlyStats as MOCK_MONTHLY_STATS,
} from '../data/mockData';

const USE_MOCK = true;

// ── Blood Bags ─────────────────────────────────────────────
export async function fetchBloodBags(): Promise<BloodBag[]> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    return MOCK_BAGS;
  }
  const { data } = await apiClient.get<BloodBag[]>('/inventory/bags');
  return data;
}

export async function exportBags(bagIds: string[], recipient: {
  recipientName: string; nationalId: string; phone?: string; reason: string;
}): Promise<void> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 400));
    return;
  }
  await apiClient.post('/inventory/bags/export', { bagIds, ...recipient });
}

export async function disposeBag(bagId: string, reason: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    return;
  }
  await apiClient.post(`/inventory/bags/${bagId}/dispose`, { reason });
}

// ── Blood Inventory Summary ────────────────────────────────
export async function fetchBloodInventory(): Promise<BloodInventoryItem[]> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 200));
    return MOCK_INVENTORY;
  }
  const { data } = await apiClient.get<BloodInventoryItem[]>('/inventory/summary');
  return data;
}

// ── Transactions ───────────────────────────────────────────
export async function fetchTransactions(): Promise<Transaction[]> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    return MOCK_TRANSACTIONS;
  }
  const { data } = await apiClient.get<Transaction[]>('/inventory/transactions');
  return data;
}

// ── Hospital Requests ──────────────────────────────────────
export async function fetchHospitalRequests(): Promise<HospitalRequest[]> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    return MOCK_REQUESTS;
  }
  const { data } = await apiClient.get<HospitalRequest[]>('/inventory/requests');
  return data;
}

export async function fulfillRequest(requestId: string, bagIds: string[]): Promise<void> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 400));
    return;
  }
  await apiClient.post(`/inventory/requests/${requestId}/fulfill`, { bagIds });
}

// ── Outflow Records ────────────────────────────────────────
export async function fetchOutflowRecords(): Promise<OutflowRecord[]> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    return MOCK_OUTFLOW;
  }
  const { data } = await apiClient.get<OutflowRecord[]>('/inventory/outflow');
  return data;
}

// ── Monthly Stats ──────────────────────────────────────────
export async function fetchMonthlyStats(): Promise<MonthlyStats[]> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 200));
    return MOCK_MONTHLY_STATS;
  }
  const { data } = await apiClient.get<MonthlyStats[]>('/stats/monthly');
  return data;
}

```

**Tool Call: Read file `src\app\api\lab.ts`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\api\lab.ts
// ═══════════════════════════════════════════════════════════
// Lab API service — tests, samples, results
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type { LabTest, Sample, TestResult } from '../types/lab';
import {
  labTests as MOCK_LAB_TESTS,
  samples as MOCK_SAMPLES,
  testResults as MOCK_TEST_RESULTS,
} from '../data/mockData';

const USE_MOCK = true;

// ── Lab Tests (blood bag screening) ────────────────────────
export async function fetchLabTests(): Promise<LabTest[]> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    return MOCK_LAB_TESTS;
  }
  const { data } = await apiClient.get<LabTest[]>('/lab/tests');
  return data;
}

export async function submitLabTestResult(testId: string, result: {
  confirmedBloodType: string;
  hcv: 'negative' | 'positive';
  hbv: 'negative' | 'positive';
  syphilis: 'negative' | 'positive';
  hiv: 'negative' | 'positive';
  notes: string;
  suitable: boolean;
}): Promise<LabTest> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 600));
    const test = MOCK_LAB_TESTS.find(t => t.id === testId);
    if (!test) throw { response: { status: 404, data: { message: 'الفحص غير موجود' } } };
    return {
      ...test,
      status: 'completed' as const,
      result: {
        ...result,
        confirmedBloodType: result.confirmedBloodType as any,
        completedAt: new Date().toLocaleString('ar-EG'),
        completedBy: 'current-user',
      },
    };
  }
  const { data } = await apiClient.post<LabTest>(`/lab/tests/${testId}/result`, result);
  return data;
}

// ── Samples ────────────────────────────────────────────────
export async function fetchSamples(): Promise<Sample[]> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    return MOCK_SAMPLES;
  }
  const { data } = await apiClient.get<Sample[]>('/lab/samples');
  return data;
}

// ── Test Results ───────────────────────────────────────────
export async function fetchTestResults(): Promise<TestResult[]> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    return MOCK_TEST_RESULTS;
  }
  const { data } = await apiClient.get<TestResult[]>('/lab/results');
  return data;
}

```

**Tool Call: Read file `src\app\api\staff.ts`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\api\staff.ts
// ═══════════════════════════════════════════════════════════
// Staff (users) API service
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type { User } from '../types/auth';
import { users as MOCK_USERS } from '../data/mockData';

const USE_MOCK = true;

export async function fetchStaff(): Promise<User[]> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    // Strip passwords before returning, and filter out admins (staff view only)
    return MOCK_USERS.filter(u => u.role !== 'admin').map(({ password: _, ...u }) => u) as User[];
  }
  const { data } = await apiClient.get<User[]>('/staff');
  return data;
}

export async function createStaff(payload: {
  name: string;
  email: string;
  password: string;
  role: string;
  nationalId: string;
  phone: string;
  address: string;
  city: string;
}): Promise<User> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 400));
    const newUser: User = {
      id: `USR-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      role: payload.role as any,
      age: 0,
      nationalId: payload.nationalId,
      phone: payload.phone,
      address: payload.address,
      city: payload.city,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    return newUser;
  }
  const { data } = await apiClient.post<User>('/staff', payload);
  return data;
}

export async function deleteStaff(id: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    return;
  }
  await apiClient.delete(`/staff/${id}`);
}

```

**Tool Call: Read file `src\app\contexts\AuthContext.tsx`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\contexts\AuthContext.tsx
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { loginApi } from '../api/auth';
import type { User, UserRole } from '../types/auth';

// ── Context shape ──────────────────────────────────────────
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ───────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('bloodlink_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { token, user: loggedInUser } = await loginApi({ email, password });

      // Persist token + user
      localStorage.setItem('bloodlink_token', token);
      localStorage.setItem('bloodlink_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);

      return { success: true };
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        'بيانات الدخول غير صحيحة، يرجى المحاولة مجدداً';
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('bloodlink_token');
    localStorage.removeItem('bloodlink_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export type { UserRole };

```

**Tool Call: Read file `src\app\contexts\AppointmentContext.tsx`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\contexts\AppointmentContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import { slot15Data, Slot15 } from '../data/mockData';

// ── Notification shape ─────────────────────────────────
export interface CancellationNotification {
  id: string;
  donorName: string;
  donorPhone?: string;
  date: string;
  time: string;
  campaignId?: string;
  cancelledAt: string;
  cancelledByName: string;
  reason?: string;
  read: boolean;
}

// ── Context shape ──────────────────────────────────────
interface AppointmentContextType {
  slots: Slot15[];
  notifications: CancellationNotification[];
  unreadCount: number;
  cancelAppointment: (slotId: string, reason: string, doctorId: string, doctorName: string) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
}

const AppointmentContext = createContext<AppointmentContextType | null>(null);

// ── Provider ───────────────────────────────────────────
export function AppointmentProvider({ children }: { children: ReactNode }) {
  const [slots, setSlots] = useState<Slot15[]>(() =>
    slot15Data.map(s => ({ ...s }))
  );
  const [notifications, setNotifications] = useState<CancellationNotification[]>([]);

  const cancelAppointment = (
    slotId: string,
    reason: string,
    doctorId: string,
    doctorName: string,
  ) => {
    const now = new Date().toLocaleString('ar-EG', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });

    let cancelled: Slot15 | undefined;

    setSlots(prev =>
      prev.map(s => {
        if (s.id !== slotId) return s;
        cancelled = s;
        return {
          ...s,
          status: 'cancelled',
          cancelledAt: now,
          cancelledBy: doctorId,
          cancelledByName: doctorName,
          cancellationReason: reason || undefined,
        };
      })
    );

    // Build notification for the donor
    const target = slots.find(s => s.id === slotId);
    if (target) {
      const notif: CancellationNotification = {
        id: `NOTIF-${Date.now()}`,
        donorName: target.donorName || '—',
        donorPhone: target.donorPhone,
        date: target.date,
        time: target.time,
        campaignId: target.campaignId,
        cancelledAt: now,
        cancelledByName: doctorName,
        reason: reason || undefined,
        read: false,
      };
      setNotifications(prev => [notif, ...prev]);
    }
  };

  const markNotificationRead = (id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppointmentContext.Provider value={{
      slots, notifications, unreadCount,
      cancelAppointment, markNotificationRead, markAllRead,
    }}>
      {children}
    </AppointmentContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────
export function useAppointments() {
  const ctx = useContext(AppointmentContext);
  if (!ctx) throw new Error('useAppointments must be used inside AppointmentProvider');
  return ctx;
}

```

**Tool Call: Read file `src\app\contexts\InventoryContext.tsx`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\contexts\InventoryContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import {
  BloodBag, Transaction, HospitalRequest, BloodBagStatus, TransactionType,
  OutflowRecord,
  bloodBags as initialBags,
  initialTransactions,
  initialHospitalRequests,
  initialOutflowRecords,
} from '../data/mockData';

export interface ExportDetails {
  recipientName: string;
  nationalId: string;
  phone: string;
  reason: string;
}

interface InventoryContextType {
  bags: BloodBag[];
  transactions: Transaction[];
  requests: HospitalRequest[];
  outflowRecords: OutflowRecord[];
  updateBagStatus: (bagId: string, status: BloodBagStatus, notes?: string, destination?: string) => void;
  updateMultipleBags: (bagIds: string[], status: BloodBagStatus, type: TransactionType, destination?: string, notes?: string, requestId?: string) => void;
  fulfillRequest: (requestId: string, bagIds: string[]) => void;
  updateRequestStatus: (requestId: string, status: HospitalRequest['status']) => void;
  addRequest: (req: Omit<HospitalRequest, 'id'>) => void;
  exportBag: (bagId: string, details: ExportDetails) => void;
  exportMultipleBags: (bagIds: string[], details: ExportDetails) => void;
  disposeBag: (bagId: string, reason: string) => void;
  disposeMultipleBags: (bagIds: string[], reason: string, options: { category: string; notes?: string; targetStatus: 'disposed' | 'rejected' }) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

function getCurrentUser() {
  try {
    const stored = localStorage.getItem('bloodlink_user');
    if (stored) {
      const u = JSON.parse(stored);
      return { id: u.id ?? 'USR-008', name: u.name ?? 'أ. نادية فتحي حسين' };
    }
  } catch {}
  return { id: 'USR-008', name: 'أ. نادية فتحي حسين' };
}

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [bags, setBags]                   = useState<BloodBag[]>(initialBags);
  const [transactions, setTransactions]   = useState<Transaction[]>(initialTransactions);
  const [requests, setRequests]           = useState<HospitalRequest[]>(initialHospitalRequests);
  const [outflowRecords, setOutflowRecords] = useState<OutflowRecord[]>(initialOutflowRecords);

  const now = () => new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });

  const addTransaction = (t: Omit<Transaction, 'id' | 'timestamp' | 'performedBy' | 'performedByName'>) => {
    const { id: userId, name: userName } = getCurrentUser();
    setTransactions(prev => [{
      ...t,
      id: `TRX-${String(Date.now()).slice(-6)}`,
      timestamp: now(),
      performedBy: userId,
      performedByName: userName,
    }, ...prev]);
  };

  const updateBagStatus = (bagId: string, status: BloodBagStatus, notes?: string, destination?: string) => {
    const bag = bags.find(b => b.id === bagId);
    if (!bag) return;
    setBags(prev => prev.map(b => b.id === bagId ? { ...b, status } : b));
    const typeMap: Record<BloodBagStatus, TransactionType | null> = {
      issued: 'issue', reserved: 'reserve', disposed: 'disposal',
      available: 'return', expired: null, rejected: null,
    };
    const txType = typeMap[status];
    if (txType) {
      addTransaction({ type: txType, bagIds: [bagId], bagCodes: [bag.bagCode], bloodType: bag.bloodType, quantity: 1, destination, notes });
    }
  };

  const updateMultipleBags = (
    bagIds: string[], status: BloodBagStatus, type: TransactionType,
    destination?: string, notes?: string, requestId?: string,
  ) => {
    const selectedBags = bags.filter(b => bagIds.includes(b.id));
    setBags(prev => prev.map(b => bagIds.includes(b.id) ? { ...b, status } : b));
    if (selectedBags.length > 0) {
      const byType = selectedBags.reduce((acc, bag) => {
        if (!acc[bag.bloodType]) acc[bag.bloodType] = [];
        acc[bag.bloodType].push(bag);
        return acc;
      }, {} as Record<string, BloodBag[]>);
      Object.entries(byType).forEach(([bloodType, bgs]) => {
        addTransaction({
          type, bagIds: bgs.map(b => b.id), bagCodes: bgs.map(b => b.bagCode),
          bloodType: bloodType as BloodBag['bloodType'], quantity: bgs.length,
          destination, notes, requestId,
        });
      });
    }
  };

  const fulfillRequest = (requestId: string, bagIds: string[]) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;
    updateMultipleBags(bagIds, 'issued', 'issue', req.hospitalName, undefined, requestId);
    const { id: userId } = getCurrentUser();
    setRequests(prev => prev.map(r => r.id === requestId ? {
      ...r, status: 'fulfilled' as const, fulfilledBy: userId, bagIds,
      fulfilledAt: now(),
    } : r));
  };

  const updateRequestStatus = (requestId: string, status: HospitalRequest['status']) => {
    const { id: userId } = getCurrentUser();
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status, approvedBy: userId } : r));
  };

  const addRequest = (req: Omit<HospitalRequest, 'id'>) => {
    setRequests(prev => [{ ...req, id: `REQ-${String(Date.now()).slice(-4)}` }, ...prev]);
  };

  const exportBag = (bagId: string, details: ExportDetails) => {
    const bag = bags.find(b => b.id === bagId);
    if (!bag) return;
    const { id: userId, name: userName } = getCurrentUser();
    setBags(prev => prev.map(b => b.id === bagId ? { ...b, status: 'issued' as const } : b));
    const record: OutflowRecord = {
      id: `OUT-${String(Date.now()).slice(-5)}`,
      bagId, bagCode: bag.bagCode, bloodType: bag.bloodType, donationType: bag.donationType,
      actionType: 'exported',
      recipientName: details.recipientName,
      nationalId: details.nationalId,
      phone: details.phone,
      reason: details.reason,
      performedBy: userId,
      performedByName: userName,
      timestamp: now(),
    };
    setOutflowRecords(prev => [record, ...prev]);
  };

  const exportMultipleBags = (bagIds: string[], details: ExportDetails) => {
    const { id: userId, name: userName } = getCurrentUser();
    const timestamp = now();
    const newRecords: OutflowRecord[] = [];
    bagIds.forEach((bagId, idx) => {
      const bag = bags.find(b => b.id === bagId);
      if (!bag) return;
      newRecords.push({
        id: `OUT-${String(Date.now() + idx).slice(-5)}`,
        bagId, bagCode: bag.bagCode, bloodType: bag.bloodType, donationType: bag.donationType,
        actionType: 'exported',
        recipientName: details.recipientName,
        nationalId: details.nationalId,
        phone: details.phone,
        reason: details.reason,
        performedBy: userId,
        performedByName: userName,
        timestamp,
      });
    });
    setBags(prev => prev.map(b => bagIds.includes(b.id) ? { ...b, status: 'issued' as const } : b));
    setOutflowRecords(prev => [...newRecords, ...prev]);
  };

  const disposeBag = (bagId: string, reason: string) => {
    const bag = bags.find(b => b.id === bagId);
    if (!bag) return;
    const { id: userId, name: userName } = getCurrentUser();
    setBags(prev => prev.map(b => b.id === bagId ? { ...b, status: 'disposed' as const } : b));
    const record: OutflowRecord = {
      id: `OUT-${String(Date.now()).slice(-5)}`,
      bagId, bagCode: bag.bagCode, bloodType: bag.bloodType, donationType: bag.donationType,
      actionType: 'disposed',
      reason,
      performedBy: userId,
      performedByName: userName,
      timestamp: now(),
    };
    setOutflowRecords(prev => [record, ...prev]);
  };

  const disposeMultipleBags = (bagIds: string[], reason: string, options: { category: string; notes?: string; targetStatus: 'disposed' | 'rejected' }) => {
    const { id: userId, name: userName } = getCurrentUser();
    const timestamp = now();
    const newRecords: OutflowRecord[] = [];
    bagIds.forEach((bagId, idx) => {
      const bag = bags.find(b => b.id === bagId);
      if (!bag) return;
      newRecords.push({
        id: `OUT-${String(Date.now() + idx).slice(-5)}`,
        bagId, bagCode: bag.bagCode, bloodType: bag.bloodType, donationType: bag.donationType,
        actionType: 'disposed',
        reason,
        disposalCategory: options.category,
        notes: options.notes,
        performedBy: userId,
        performedByName: userName,
        timestamp,
      });
    });
    setBags(prev => prev.map(b => bagIds.includes(b.id) ? { ...b, status: options.targetStatus as BloodBagStatus } : b));
    setOutflowRecords(prev => [...newRecords, ...prev]);
  };

  return (
    <InventoryContext.Provider
      value={{
        bags, transactions, requests, outflowRecords,
        updateBagStatus, updateMultipleBags,
        fulfillRequest, updateRequestStatus, addRequest,
        exportBag, exportMultipleBags, disposeBag, disposeMultipleBags,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
}
```

## Assistant

<thinking>
Let me now read the component files to check for direct mockData imports and form implementations.
</thinking>

Now let me read the component files to check for mock data coupling and form patterns:

**Tool Call: Read file `src\app\components\doctor\DonorRegistrationForm.tsx`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\components\doctor\DonorRegistrationForm.tsx
SUCCESS: File outline retrieved. This file is too large to read all at once, so the outline below shows the file's structure with line numbers.

IMPORTANT: Do NOT retry this call without line numbers - you will get the same outline.
Instead, use the line numbers below to read specific sections by calling this tool again with start_line and end_line parameters.

# File outline for D:\Graduation!!!\Blood-Bank-System\src\app\components\doctor\DonorRegistrationForm.tsx

interface SimpleForm [L15-38]
const DISTRICTS [L40-42]
const initialForm [L44-67]
 name [L45]
 gender [L46]
 age [L47]
 phone [L48]
 nationalId [L49]
 governorate [L50]
 district [L51]
 area [L52]
 bloodType [L53]
 donationType [L54]
 diseases [L55]
 source [L56]
 campaignId [L57]
 status [L58]
 weight [L59]
 bloodPressure [L60]
 hemoglobin [L61]
 isAllergic [L62]
 rejectionReason [L63]
 lockoutUntil [L64]
 deferredUntil [L65]
 donationTime [L66]
function DonorRegistrationForm() [L69-921]
 const navigate [L70]
 const user [L71]
 const searchParams [L72]
 const aptId [L75]
 const appointment [L76]
 const getInitialForm [L78-96]
  name [L82]
  gender [L83]
  age [L84]
  phone [L85]
  nationalId [L86]
  district [L87]
  area [L88]
  bloodType [L89]
  donationType [L90]
  source [L91]
  donationTime [L92]
 const form [L98]
 const setForm [L98]
 const errors [L99]
 const setErrors [L99]
 const success [L100]
 const setSuccess [L100]
 const submitting [L101]
 const setSubmitting [L101]
 const donorCode [L102]
 const step [L103]
 const setStep [L103]
 const bagVolume [L104]
 const setBagVolume [L104]
 const createDonor [L105]
 const activeCampaigns [L107]
 const updateField [L109-112]
  [key] [L110]
  const e [L111]
 const toggleDisease [L114-119]
  diseases [L117]
 const validate [L121-132]
  const e [L122]
 const handleSubmit [L134-167]
  name [L139]
  gender [L140]
  age [L141]
  phone [L142]
  nationalId [L143]
  governorate [L144]
  district [L145]
  area [L146]
  bloodType [L147]
  donationType [L148]
  diseases [L149]
  source [L150]
  campaignId [L151]
  status [L152]
  weight [L153]
  bloodPressure [L154]
  hemoglobin [L155]
  isAllergic [L156]
  rejectionReason [L157]
  lockoutUntil [L158]
  deferredUntil [L159]
 const handleNextStep [L169-171]
 const selectedCampaign [L173]
 const today [L176]
  weekday [L176]
  year [L176]
  month [L176]
  day [L176]
 const donationTypeLabel [L177]
  whole [L177]
  plasma [L177]
  platelets [L177]
 const isEligible [L178]
 const isDeferred [L186]
 width [L195]
 height [L195]
 fontSize [L201]
 fontWeight [L201]
 fontSize [L204]
 fontSize [L214]
 fontWeight [L214]
 fontSize [L215]
 fontWeight [L215]
 fontSize [L219]
 fontWeight [L219]
 fontSize [L220]
 fontWeight [L220]
 fontSize [L224]
 fontWeight [L224]
 fontSize [L227]
 fontWeight [L227]
 fontSize [L236]
 fontWeight [L236]
 fontSize [L237]
 fontSize [L245]
 fontWeight [L245]
 fontSize [L246]
 fontWeight [L246]
 fontSize [L260]
 fontWeight [L260]
 background [L267]
 fontSize [L267]
 fontWeight [L267]
 fontSize [L292]
 fontWeight [L292]
 fontSize [L293]
 fontSize [L299]
 fontWeight [L299]
 fontSize [L300]
 fontWeight [L300]
 letterSpacing [L300]
 fontSize [L309]
 fontWeight [L309]
 fontSize [L314]
 fontWeight [L314]
 fontSize [L315]
 fontWeight [L315]
 fontSize [L318]
 fontWeight [L318]
 fontSize [L319]
 fontWeight [L319]
 fontSize [L322]
 fontWeight [L322]
 fontSize [L323]
 fontWeight [L323]
 fontSize [L330]
 fontWeight [L330]
 fontSize [L345]
 fontWeight [L345]
 fontSize [L348]
 fontWeight [L348]
 fontSize [L354]
 fontWeight [L354]
 fontSize [L358]
 fontSize [L366]
 fontWeight [L366]
 fontSize [L371]
 fontSize [L372]
 fontWeight [L372]
 fontSize [L375]
 fontSize [L376]
 fontWeight [L376]
 fontSize [L384]
 fontWeight [L384]
 fontSize [L386]
 fontWeight [L386]
 fontSize [L387]
 fontWeight [L387]
 fontSize [L394]
 lineHeight [L394]
 fontSize [L404]
 fontWeight [L404]
 background [L411]
 fontSize [L411]
 fontWeight [L411]
 boxShadow [L411]
 fontSize [L427]
 fontWeight [L427]
 fontSize [L428]
 fontSize [L436]
 fontWeight [L436]
 fontSize [L439]
 fontSize [L454]
 fontWeight [L454]
 fontSize [L456]
 fontWeight [L456]
 fontSize [L463]
 fontWeight [L463]
 fontSize [L465]
 fontWeight [L465]
 fontSize [L476]
 fontWeight [L476]
 fontSize [L488]
 fontWeight [L488]
 fontSize [L489]
 fontSize [L503]
 fontWeight [L503]
 fontSize [L504]
 fontSize [L516]
 fontSize [L523]
 fontSize [L526]
 fontWeight [L526]
 fontSize [L527]
 fontSize [L538]
 fontWeight [L538]
 fontSize [L544]
 fontSize [L545]
 fontSize [L551]
 fontWeight [L551]
 fontSize [L556]
 fontWeight [L556]
 fontSize [L559]
 fontSize [L562]
 fontWeight [L562]
 fontSize [L565]
 fontSize [L566]
 fontSize [L573]
 fontWeight [L573]
 fontSize [L579]
 fontSize [L580]
 fontSize [L583]
 fontWeight [L583]
 fontSize [L592]
 fontSize [L593]
 fontSize [L599]
 fontWeight [L599]
 fontSize [L606]
 fontWeight [L606]
 fontSize [L608]
 fontSize [L615]
 fontWeight [L615]
 fontSize [L620]
 fontSize [L627]
 fontWeight [L627]
 fontSize [L633]
 fontSize [L635]
 fontSize [L647]
 fontWeight [L647]
 fontSize [L660]
 fontWeight [L660]
 fontWeight [L662]
 fontSize [L668]
 fontWeight [L668]
 fontSize [L675]
 fontWeight [L675]
 fontSize [L680]
 fontSize [L681]
 fontWeight [L681]
 fontSize [L691]
 fontWeight [L691]
 fontWeight [L693]
 fontSize [L699]
 fontWeight [L699]
 fontSize [L707]
 fontSize [L711]
 fontWeight [L711]
 fontSize [L719]
 fontSize [L723]
 fontWeight [L723]
 fontSize [L732]
 fontSize [L745]
 fontWeight [L745]
 fontSize [L759]
 fontWeight [L759]
 fontWeight [L761]
 fontSize [L769]
 fontWeight [L769]
 fontSize [L776]
 fontWeight [L776]
 fontSize [L787]
 fontWeight [L787]
 fontSize [L797]
 fontWeight [L797]
 fontSize [L798]
 fontSize [L807]
 fontWeight [L807]
 fontSize [L808]
 fontSize [L817]
 fontWeight [L817]
 fontSize [L818]
 fontSize [L827]
 fontWeight [L827]
 fontWeight [L828]
 fontSize [L836]
 fontSize [L840]
 fontWeight [L840]
 fontWeight [L841]
 fontSize [L848]
 fontSize [L858]
 fontWeight [L858]
 fontWeight [L859]
 fontSize [L867]
 fontSize [L869]
 fontSize [L872]
 fontWeight [L872]
 fontWeight [L873]
 fontSize [L880]
 fontSize [L891]
 fontWeight [L891]
 fontSize [L896]
 fontWeight [L896]
 fontSize [L917]
 fontWeight [L917]

Showing symbols 1-309 (total symbols: 309)


NEXT STEPS: To read a specific symbol's implementation, call read_file with the same path plus start_line and end_line from the outline above.
For example, to read a function shown as [L100-150], use start_line: 100 and end_line: 150.
```

**Tool Call: Read file `src\app\components\auth\LoginPage.tsx`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\components\auth\LoginPage.tsx
SUCCESS: File outline retrieved. This file is too large to read all at once, so the outline below shows the file's structure with line numbers.

IMPORTANT: Do NOT retry this call without line numbers - you will get the same outline.
Instead, use the line numbers below to read specific sections by calling this tool again with start_line and end_line parameters.

# File outline for D:\Graduation!!!\Blood-Bank-System\src\app\components\auth\LoginPage.tsx

const demoAccounts [L11-64]
 role [L13]
 label [L14]
 desc [L15]
 sublabel [L16]
 email [L17]
 password [L18]
 icon [L19]
 accent [L20]
 light [L21]
 border [L22]
 textColor [L23]
 role [L26]
 label [L27]
 desc [L28]
 sublabel [L29]
 email [L30]
 password [L31]
 icon [L32]
 accent [L33]
 light [L34]
 border [L35]
 textColor [L36]
 role [L39]
 label [L40]
 desc [L41]
 sublabel [L42]
 email [L43]
 password [L44]
 icon [L45]
 accent [L46]
 light [L47]
 border [L48]
 textColor [L49]
 role [L52]
 label [L53]
 desc [L54]
 sublabel [L55]
 email [L56]
 password [L57]
 icon [L58]
 accent [L59]
 light [L60]
 border [L61]
 textColor [L62]
const stats [L67-72]
 icon [L68]
 value [L68]
 label [L68]
 icon [L69]
 value [L69]
 label [L69]
 icon [L70]
 value [L70]
 label [L70]
 icon [L71]
 value [L71]
 label [L71]
function LoginPage() [L74-491]
 const navigate [L75]
 const login [L76]
 const user [L76]
 const email [L78]
 const setEmail [L78]
 const password [L79]
 const setPassword [L79]
 const showPass [L80]
 const setShowPass [L80]
 const error [L81]
 const setError [L81]
 const loading [L82]
 const setLoading [L82]
 const activeRole [L83]
 const setActiveRole [L83]
 const dest [L88-91]
 replace [L92]
 const fillDemo [L96-101]
 const handleSubmit [L104-124]
  const result [L112]
  const u [L115]
  const dest [L116-119]
  replace [L120]
 background [L130]
 background [L135]
 background [L137]
 background [L139]
 background [L148]
 backgroundImage [L153]
 backgroundSize [L154]
 background [L164]
 backdropFilter [L164]
 fontSize [L168]
 fontWeight [L168]
 color [L168]
 letterSpacing [L168]
 fontSize [L171]
 color [L171]
 background [L178]
 fontSize [L180]
 fontWeight [L180]
 color [L180]
 fontSize [L183]
 fontWeight [L183]
 lineHeight [L183]
 color [L183]
 marginBottom [L183]
 color [L185]
 fontSize [L187]
 lineHeight [L187]
 color [L187]
 maxWidth [L187]
 marginBottom [L187]
 background [L196]
 border [L196]
 background [L198]
 fontSize [L202]
 fontWeight [L202]
 color [L202]
 fontSize [L203]
 color [L203]
 background [L213]
 border [L213]
 fontSize [L215]
 fontWeight [L215]
 color [L215]
 fontSize [L216]
 color [L216]
 lineHeight [L216]
 fontSize [L223]
 color [L223]
 marginTop [L223]
 background [L238]
 fontSize [L241]
 fontWeight [L241]
 color [L241]
 fontSize [L242]
 color [L242]
 fontSize [L247]
 fontWeight [L247]
 color [L247]
 marginBottom [L247]
 fontSize [L250]
 color [L250]
 fontSize [L257]
 fontWeight [L257]
 color [L257]
 marginBottom [L257]
 const Icon [L262]
 const isActive [L263]
 background [L271]
 borderColor [L272]
 boxShadow [L273-275]
 transform [L276]
 background [L282]
 background [L289]
 boxShadow [L290]
 color [L292]
 fontSize [L298]
 fontWeight [L298]
 color [L299]
 marginBottom [L300]
 fontSize [L307]
 fontFamily [L307]
 fontWeight [L307]
 background [L308]
 color [L309]
 border [L310]
 background [L319]
 fontSize [L336]
 color [L336]
 whiteSpace [L336]
 background [L345]
 borderColor [L345]
 color [L346]
 fontSize [L347]
 color [L347]
 fontSize [L358]
 fontWeight [L358]
 color [L358]
 fontSize [L374]
 background [L375]
 borderColor [L376]
 color [L377]
 fontSize [L398]
 fontWeight [L398]
 color [L398]
 fontSize [L413]
 background [L414]
 borderColor [L415]
 color [L416]
 fontSize [L446]
 fontWeight [L447]
 background [L448-450]
 boxShadow [L451]
 cursor [L452]
 background [L475]
 fontSize [L476]
 color [L476]
 fontSize [L479]
 color [L479]
 marginTop [L479]
 fontSize [L484]
 color [L484]

Showing symbols 1-203 (total symbols: 203)


NEXT STEPS: To read a specific symbol's implementation, call read_file with the same path plus start_line and end_line from the outline above.
For example, to read a function shown as [L100-150], use start_line: 100 and end_line: 150.
```

**Tool Call: Read file `src\app\components\shared\LoadingSkeleton.tsx`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\components\shared\LoadingSkeleton.tsx
// ═══════════════════════════════════════════════════════════
// Shared loading skeleton for Phase 3 component migration
// ═══════════════════════════════════════════════════════════

/** Full-page shimmer loader */
export function PageLoader({ message = 'جاري التحميل...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 rounded-full border-4 border-green-100 border-t-green-600 animate-spin" />
      </div>
      <p className="text-gray-500" style={{ fontSize: '14px', fontWeight: 600 }}>{message}</p>
    </div>
  );
}

/** Error state with retry */
export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
        <span className="text-3xl">⚠️</span>
      </div>
      <p className="text-gray-700" style={{ fontSize: '16px', fontWeight: 700 }}>حدث خطأ</p>
      <p className="text-gray-500" style={{ fontSize: '14px' }}>{message || 'تعذر تحميل البيانات'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
          style={{ fontSize: '14px', fontWeight: 600 }}
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}

/** Card shimmer placeholder */
export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse">
          <div className="w-11 h-11 bg-gray-200 rounded-xl mb-4" />
          <div className="h-8 w-16 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-24 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}

/** Table shimmer placeholder */
export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="p-5 border-b border-gray-100">
        <div className="h-5 w-32 bg-gray-200 rounded" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-4 py-3 text-right">
                  <div className="h-3 w-16 bg-gray-200 rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="border-b border-gray-50">
                {Array.from({ length: cols }).map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className={`h-4 bg-gray-100 rounded`} style={{ width: `${60 + Math.random() * 40}%` }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

```

**Tool Call: Read file `src\app\components\doctor\DonorRegistrationForm.tsx` (lines 69-170)**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\components\doctor\DonorRegistrationForm.tsx
export default function DonorRegistrationForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Pre-fill from appointment if ?apt=S15-xxx
  const aptId = searchParams.get('apt');
  const appointment = aptId ? slot15Data.find(s => s.id === aptId) : null;

  const getInitialForm = (): SimpleForm => {
    if (appointment) {
      return {
        ...initialForm,
        name: appointment.donorName || '',
        gender: appointment.donorGender || '',
        age: appointment.donorAge ? String(appointment.donorAge) : '',
        phone: appointment.donorPhone || '',
        nationalId: appointment.donorNationalId || '',
        district: appointment.donorDistrict || 'بني سويف',
        area: appointment.donorArea || '',
        bloodType: appointment.donorBloodType || '',
        donationType: appointment.donationType || 'whole',
        source: 'app',
        donationTime: appointment.time || new Date().toTimeString().slice(0, 5),
      };
    }
    return initialForm;
  };

  const [form, setForm] = useState<SimpleForm>(getInitialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [donorCode] = useState(`DNR-2025-${String(Math.floor(Math.random() * 9000) + 1000)}`);
  const [step, setStep] = useState<1 | 2>(1);
  const [bagVolume, setBagVolume] = useState('400'); // ← added outside selected element
  const createDonor = useCreateDonor();

  const activeCampaigns = campaigns.filter(c => c.status === 'active');

  const updateField = (key: keyof SimpleForm, value: any) => {
    setForm(p => ({ ...p, [key]: value }));
    setErrors(p => { const e = { ...p }; delete e[key]; return e; });
  };

  const toggleDisease = (id: string) => {
    setForm(p => ({
      ...p,
      diseases: p.diseases.includes(id) ? p.diseases.filter(d => d !== id) : [...p.diseases, id],
    }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().split(' ').length < 2) e.name = 'أدخل الاسم الثنائي على الأقل';
    if (!form.gender) e.gender = 'اختر الجنس';
    if (!form.age || +form.age < 18 || +form.age > 65) e.age = 'العمر يجب أن يكون بين 18 و65 سنة';
    if (!form.phone || form.phone.length < 11) e.phone = 'رقم هاتف غير صحيح';
    if (!form.nationalId || form.nationalId.length !== 14 || !/^\d+$/.test(form.nationalId)) e.nationalId = 'رقم الهوية يجب أن يكون 14 رقماً';
    if (!form.area.trim()) e.area = 'أدخل المنطقة';
    if (form.source === 'campaign' && !form.campaignId) e.campaignId = 'اختر الحملة';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createDonor.mutateAsync({
        name: form.name,
        gender: form.gender as any,
        age: Number(form.age),
        phone: form.phone,
        nationalId: form.nationalId,
        governorate: form.governorate,
        district: form.district,
        area: form.area,
        bloodType: form.bloodType || undefined,
        donationType: form.donationType as any,
        diseases: form.diseases,
        source: form.source,
        campaignId: form.campaignId || undefined,
        status: form.status,
        weight: Number(form.weight) || undefined,
        bloodPressure: form.bloodPressure || undefined,
        hemoglobin: Number(form.hemoglobin) || undefined,
        isAllergic: form.isAllergic,
        rejectionReason: form.rejectionReason || undefined,
        lockoutUntil: form.lockoutUntil || undefined,
        deferredUntil: form.deferredUntil || undefined,
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextStep = () => {
    if (validate()) { setErrors({}); setStep(2); }

```

**Tool Call: Read file `src\app\components\auth\LoginPage.tsx` (lines 74-130)**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\components\auth\LoginPage.tsx
export default function LoginPage() {
  const navigate  = useNavigate();
  const { login, user } = useAuth();

  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [activeRole,  setActiveRole]  = useState<typeof demoAccounts[0] | null>(null);

  /* redirect if already logged in */
  useEffect(() => {
    if (!user) return;
    const dest = user.role === 'admin' ? '/admin'
               : user.role === 'lab'   ? '/lab'
               : user.role === 'inventory' ? '/inventory'
               : '/doctor';
    navigate(dest, { replace: true });
  }, [user, navigate]);

  /* fill demo account */
  const fillDemo = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setActiveRole(acc);
    setError('');
  };

  /* submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }
    setError('');
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (result.success) {
      const u = JSON.parse(localStorage.getItem('bloodlink_user') || '{}');
      const dest = u.role === 'admin' ? '/admin'
                 : u.role === 'lab'   ? '/lab'
                 : u.role === 'inventory' ? '/inventory'
                 : '/doctor';
      navigate(dest, { replace: true });
    } else {
      setError(result.error || 'بيانات الدخول غير صحيحة، يرجى المحاولة مجدداً');
    }
  };

  return (
    <div
      className="min-h-screen flex"
      dir="rtl"
      style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f0fdf4 50%, #f8fafc 100%)' }}

```

**Tool Call: Search files for regex `import.*mockData|from.*mockData|from.*data/mockData`**
Status: Completed

Showing matches 1-20 (there were more matches found; use offset: 20 to see next page):

## Matches in Blood-Bank-System\src\app\components\admin\AdminAnalytics.tsx

### L1-11

```
import { useState } from 'react';
import { TrendingUp, BarChart3, PieChart, Map, Download } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart as RPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import { donationTrends, areaData, bloodTypeDistribution } from '../../data/mockData';

const shortageData = [
  { month: 'مايو', predicted: 220, current: 198 },
  { month: 'يونيو', predicted: 180, current: 165 },
```

188 lines remaining in ancestor node. Read the file to see all.

## Matches in Blood-Bank-System\src\app\components\admin\AdminDonors.tsx

### L1-11

```
import { useState } from 'react';
import { Search, Filter, Edit2, X, Save, ChevronDown, Building2, Smartphone } from 'lucide-react';
import { BLOOD_TYPES, CITIES } from '../../data/mockData';
import { useDonors } from '../../hooks/useDonors';
import { PageLoader, ErrorState } from '../shared/LoadingSkeleton';

type Donor = any;

const statusColors: Record<string, string> = { eligible: 'bg-green-100 text-green-700', ineligible: 'bg-red-100 text-red-700', deferred: 'bg-orange-100 text-orange-700' };
const statusLabels: Record<string, string> = { eligible: 'مؤهل', ineligible: 'غير مؤهل', deferred: 'موجل' };
const donationTypeLabels: Record<string, string> = { whole: 'دم كامل', plasma: 'بلازما', platelets: 'صفائح' };
```

238 lines remaining in ancestor node. Read the file to see all.

## Matches in Blood-Bank-System\src\app\components\admin\AdminEmergency.tsx

### L1-11

```
import { useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Phone, MapPin, Clock, Droplets, X, Send } from 'lucide-react';
import { emergencyRequests } from '../../data/mockData';

type EmReq = typeof emergencyRequests[0];

const urgencyConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  critical: { label: 'طارئ جداً', color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-200' },
  high: { label: 'عالي', color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-200' },
  medium: { label: 'متوسط', color: 'text-yellow-700', bg: 'bg-yellow-100', border: 'border-yellow-200' },
};
```

190 lines remaining in ancestor node. Read the file to see all.

## Matches in Blood-Bank-System\src\app\components\admin\AdminInventory.tsx

### L1-11

```
import { useState } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Droplets, RefreshCw } from 'lucide-react';
import { BloodInventoryItem } from '../../data/mockData';
import { useBloodInventory } from '../../hooks/useInventory';
import { PageLoader, ErrorState } from '../shared/LoadingSkeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const statusColors: Record<string, string> = { normal: 'bg-green-100 text-green-700', low: 'bg-yellow-100 text-yellow-700', critical: 'bg-red-100 text-red-700' };
const statusLabels: Record<string, string> = { normal: 'طبيعي', low: 'منخفض', critical: 'حرج' };
const barColors: Record<string, string> = { normal: '#22c55e', low: '#f59e0b', critical: '#ef4444' };

```

180 lines remaining in ancestor node. Read the file to see all.

## Matches in Blood-Bank-System\src\app\components\admin\AdminInventoryAlerts.tsx

### L1-11

```
import { useState } from 'react';
import { AlertTriangle, TrendingUp, Clock, Settings2, Save, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { BLOOD_TYPES, BloodType, bloodInventory, monthlyStats } from '../../data/mockData';
import { useBloodBags, useTransactions, useHospitalRequests } from '../../hooks/useInventory';
import { PageLoader, ErrorState } from '../shared/LoadingSkeleton';

const TODAY = new Date('2025-04-29');

function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));
```

241 lines remaining in ancestor node. Read the file to see all.

## Matches in Blood-Bank-System\src\app\components\admin\AdminStaff.tsx

### L1-11

```
import { useState } from 'react';
import {
  UserPlus, Search, Trash2, Copy, Check, X, Eye, EyeOff,
  ChevronDown, FlaskConical, Stethoscope, Phone, MapPin, CreditCard, User as UserIcon, Mail, Package
} from 'lucide-react';
import { users as initialUsers, User, CITIES } from '../../data/mockData';
import { useStaff, useCreateStaff, useDeleteStaff } from '../../hooks/useStaff';
import { PageLoader, ErrorState } from '../shared/LoadingSkeleton';

type StaffRole = 'doctor' | 'lab' | 'inventory';

```

427 lines remaining in ancestor node. Read the file to see all.

## Matches in Blood-Bank-System\src\app\components\doctor\DoctorAppointments.tsx

### L1-11

```
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  CalendarDays, Clock, User, CheckCircle2, XCircle, AlertTriangle,
  Smartphone, Phone, Hash, Droplets, UserPlus, Filter, Megaphone,
  Bell, BellOff, Ban, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Slot15, campaigns } from '../../data/mockData';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useAppointments } from '../../contexts/AppointmentContext';
import { useAuth } from '../../contexts/AuthContext';
```

592 lines remaining in ancestor node. Read the file to see all.

## Matches in Blood-Bank-System\src\app\components\doctor\DoctorCampaigns.tsx

### L1-11

```
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  MapPin, Calendar, Users, Plus, X, TrendingUp, Check, CalendarDays,
  ChevronDown, UserPlus, XCircle, Clock, LayoutGrid, Info,
} from 'lucide-react';
import { campaigns as initialCampaigns, Campaign, CITIES, Slot15 } from '../../data/mockData';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useAuth } from '../../contexts/AuthContext';
import { useAppointments } from '../../contexts/AppointmentContext';
import { CancelModal } from '../shared/CancelModal';
```

637 lines remaining in ancestor node. Read the file to see all.

## Matches in Blood-Bank-System\src\app\components\doctor\DoctorDonors.tsx

### L1-11

```
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { UserPlus, Search, Eye, ChevronDown, X, Building2, Smartphone, Megaphone, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { BLOOD_TYPES, CITIES } from '../../data/mockData';
import { useDonors } from '../../hooks/useDonors';
import { PageLoader, ErrorState } from '../shared/LoadingSkeleton';

type Donor = any;
type BloodType = string;

const statusColors: Record<string, string> = {
```

288 lines remaining in ancestor node. Read the file to see all.

## Matches in Blood-Bank-System\src\app\components\doctor\DoctorEligibility.tsx

### L1-11

```
import { useState, useMemo } from 'react';
import {
  Heart, Bell, Phone, Search, CheckCircle2, Clock, XCircle,
  AlertTriangle, Send, Users, Zap, Smartphone
} from 'lucide-react';
import { donors, BLOOD_TYPES, BloodType, Donor } from '../../data/mockData';
import { useDonors } from '../../hooks/useDonors';
import { PageLoader, ErrorState } from '../shared/LoadingSkeleton';

// ──────────────────────────────────────────
// Eligibility engine
```

330 lines remaining in ancestor node. Read the file to see all.

## Matches in Blood-Bank-System\src\app\components\doctor\DonorRegistrationForm.tsx

### L1-11

```
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  CheckCircle2, User, Droplets, Phone, Activity,
  Building2, MapPin, CreditCard, UserCheck, UserX,
  Megaphone, Scale, Heart, FlaskConical, AlertTriangle, CalendarDays, Clock, Smartphone,
  ChevronLeft, ChevronRight, Check, Timer,
} from 'lucide-react';
import { BLOOD_TYPES, DISEASES, CITIES, campaigns, slot15Data } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { useCampaigns } from '../../hooks/useCampaigns';
```

910 lines remaining in ancestor node. Read the file to see all.

## Matches in Blood-Bank-System\src\app\components\inventory\InventoryBags.tsx

### L1-11

```
import { useState, useMemo } from 'react';
import { Search, Package, Check, X, AlertTriangle, Upload, Trash2, ShoppingCart, AlertCircle, ChevronLeft } from 'lucide-react';
import { BloodBag, BLOOD_TYPES, BloodType } from '../../data/mockData';
import { useBloodBags, useExportBags, useDisposeBag } from '../../hooks/useInventory';
import { PageLoader, ErrorState } from '../shared/LoadingSkeleton';

const TODAY = new Date('2025-04-29');
function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));
}

```

528 lines remaining in ancestor node. Read the file to see all.

## Matches in Blood-Bank-System\src\app\components\inventory\InventoryDashboard.tsx

### L1-11

```
import { useNavigate } from 'react-router';
import { Package, History, TrendingUp, TrendingDown, AlertTriangle, Clock, CheckCircle, ArrowUpRight, Droplets } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { BLOOD_TYPES, BloodType } from '../../data/mockData';
import { useBloodBags, useOutflowRecords } from '../../hooks/useInventory';
import { PageLoader, ErrorState } from '../shared/LoadingSkeleton';

const TODAY = new Date('2025-04-29');
function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));
}
```

192 lines remaining in ancestor node. Read the file to see all.

## Matches in Blood-Bank-System\src\app\components\inventory\InventoryDisposal.tsx

### L13-17

```
  ShieldOff,
} from "lucide-react";
import { BloodBag, BLOOD_TYPES, BloodType } from "../../data/mockData";
import {
  useBloodBags,
```

## Matches in Blood-Bank-System\src\app\components\inventory\InventoryHistory.tsx

### L1-11

```
import { useState } from 'react';
import { History, Search, Upload, Trash2, Download, TrendingDown, Package, Eye, X, User, Phone, CreditCard, FileText, Clock, UserCheck } from 'lucide-react';
import { OutflowActionType, OutflowRecord, BLOOD_TYPES, BloodType } from '../../data/mockData';
import { useBloodBags, useOutflowRecords } from '../../hooks/useInventory';
import { PageLoader, ErrorState } from '../shared/LoadingSkeleton';

const donTypeLabels: Record<string, string> = { whole: 'دم كامل', plasma: 'بلازما', platelets: 'صفائح' };

function DetailModal({ record, onClose }: { record: OutflowRecord; onClose: () => void }) {
  const isExport = record.actionType === 'exported';
  return (
```

295 lines remaining in ancestor node. Read the file to see all.

## Matches in Blood-Bank-System\src\app\components\inventory\InventoryRequests.tsx

### L1-11

```
import { useState } from 'react';
import { Building2, CheckCircle, X, Package, AlertTriangle, Search, Plus } from 'lucide-react';
import { useInventory as useInventoryContext } from '../../contexts/InventoryContext';
import { BloodBag, HOSPITALS, BLOOD_TYPES, BloodType } from '../../data/mockData';
import { useBloodBags, useHospitalRequests, useFulfillRequest } from '../../hooks/useInventory';
import { PageLoader, ErrorState } from '../shared/LoadingSkeleton';

const urgencyColors: Record<string, string> = {
  normal: 'bg-blue-100 text-blue-700',
  urgent: 'bg-orange-100 text-orange-700',
  emergency: 'bg-red-100 text-red-700',
```

275 lines remaining in ancestor node. Read the file to see all.

## Matches in Blood-Bank-System\src\app\components\inventory\InventoryTransactions.tsx

### L1-11

```
import { useState } from 'react';
import { ArrowLeftRight, Search, Filter, Download } from 'lucide-react';
import { BLOOD_TYPES, BloodType, TransactionType } from '../../data/mockData';
import { useTransactions } from '../../hooks/useInventory';
import { PageLoader, ErrorState } from '../shared/LoadingSkeleton';

const typeColors: Record<TransactionType, string> = {
  issue:    'bg-blue-100 text-blue-700',
  return:   'bg-green-100 text-green-700',
  disposal: 'bg-red-100 text-red-600',
  receive:  'bg-purple-100 text-purple-700',
```

127 lines remaining in ancestor node. Read the file to see all.

## Matches in Blood-Bank-System\src\app\components\lab\LabDashboard.tsx

### L13-17

```
  ChevronRight,
} from "lucide-react";
import { LabTest, BLOOD_TYPES } from "../../data/mockData";
import { useLabTests, useSubmitLabResult } from "../../hooks/useLabTests";
import { PageLoader, ErrorState } from "../shared/LoadingSkeleton";
```

## Matches in Blood-Bank-System\src\app\components\lab\LabResults.tsx

### L1-11

```
import { useState } from 'react';
import {
  Search, CheckCircle2, XCircle, Clock, Eye, X,
  FlaskConical, Filter, CreditCard, Check
} from 'lucide-react';
import { testResults as initialResults, samples, donors } from '../../data/mockData';
import { useTestResults, useSamples } from '../../hooks/useLabTests';
import { useDonors } from '../../hooks/useDonors';
import { PageLoader, ErrorState } from '../shared/LoadingSkeleton';

// ────────────────────────────────────────────────────────
```

513 lines remaining in ancestor node. Read the file to see all.

## Matches in Blood-Bank-System\src\app\components\mobile\MobileApp.tsx

### L1-11

```
import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Home, Calendar, Clock, User, Bell, Heart, Droplets, MapPin, Trophy,
  ArrowRight, ChevronRight, AlertTriangle, CheckCircle2, Star, Gift,
  Phone, LogIn, UserPlus, Shield, Activity, X, ArrowLeft, Search,
  Flame, Award, TrendingUp
} from 'lucide-react';
import { donorHistory, leaderboard, notifications } from '../../data/mockData';

type Screen = 'login' | 'register' | 'home' | 'book' | 'eligibility' | 'history' | 'profile' | 'leaderboard' | 'notifications' | 'emergency' | 'map' | 'bookSuccess';
```

1012 lines remaining in ancestor node. Read the file to see all.

**Tool Call: Search files for regex `import.*mockData|from.*mockData|from.*data/mockData`**
Status: Completed

Found 6 matches:

## Matches in Blood-Bank-System\src\app\api\appointments.ts

### L6-9

```
import {
  appointmentSlots as MOCK_SLOTS,
  slot15Data as MOCK_SLOT15,
} from '../data/mockData';
```

## Matches in Blood-Bank-System\src\app\api\campaigns.ts

### L1-11

```
// ═══════════════════════════════════════════════════════════
// Campaigns API service
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type { Campaign, CreateCampaignRequest } from '../types/campaign';
import { campaigns as MOCK_CAMPAIGNS } from '../data/mockData';

const USE_MOCK = true;

export async function fetchCampaigns(): Promise<Campaign[]> {
  if (USE_MOCK) {
```

16 lines remaining in ancestor node. Read the file to see all.

## Matches in Blood-Bank-System\src\app\api\donors.ts

### L1-11

```
// ═══════════════════════════════════════════════════════════
// Donors API service
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type { Donor, CreateDonorRequest } from '../types/donor';
import { donors as MOCK_DONORS } from '../data/mockData';

const USE_MOCK = true;

export async function fetchDonors(): Promise<Donor[]> {
  if (USE_MOCK) {
```

32 lines remaining in ancestor node. Read the file to see all.

## Matches in Blood-Bank-System\src\app\api\inventory.ts

### L9-16

```
import {
  bloodBags as MOCK_BAGS,
  bloodInventory as MOCK_INVENTORY,
  initialTransactions as MOCK_TRANSACTIONS,
  initialHospitalRequests as MOCK_REQUESTS,
  initialOutflowRecords as MOCK_OUTFLOW,
  monthlyStats as MOCK_MONTHLY_STATS,
} from '../data/mockData';
```

## Matches in Blood-Bank-System\src\app\api\lab.ts

### L6-10

```
import {
  labTests as MOCK_LAB_TESTS,
  samples as MOCK_SAMPLES,
  testResults as MOCK_TEST_RESULTS,
} from '../data/mockData';
```

## Matches in Blood-Bank-System\src\app\api\staff.ts

### L1-11

```
// ═══════════════════════════════════════════════════════════
// Staff (users) API service
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type { User } from '../types/auth';
import { users as MOCK_USERS } from '../data/mockData';

const USE_MOCK = true;

export async function fetchStaff(): Promise<User[]> {
  if (USE_MOCK) {
```

47 lines remaining in ancestor node. Read the file to see all.

## Assistant

<thinking>
Now I have a comprehensive view of the project. Let me check the remaining files I haven't looked at yet.
</thinking>

Now let me check the remaining hooks, the App.tsx, routes, and some more component details:

**Tool Call: Read file `src\app\hooks\useStaff.ts`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\hooks\useStaff.ts
// ═══════════════════════════════════════════════════════════
// React Query hooks — Staff (users)
// ═══════════════════════════════════════════════════════════
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchStaff, createStaff, deleteStaff } from '../api/staff';

/** Fetch all staff members (excludes admins) */
export function useStaff() {
  return useQuery({
    queryKey: ['staff'],
    queryFn: fetchStaff,
  });
}

/** Create a new staff member */
export function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createStaff,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

/** Delete a staff member */
export function useDeleteStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStaff(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

```

**Tool Call: Read file `src\app\hooks\useCampaigns.ts`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\hooks\useCampaigns.ts
// ═══════════════════════════════════════════════════════════
// React Query hooks — Campaigns
// ═══════════════════════════════════════════════════════════
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCampaigns, createCampaign } from '../api/campaigns';
import type { CreateCampaignRequest } from '../types/campaign';

/** Fetch all campaigns */
export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: fetchCampaigns,
  });
}

/** Create a new campaign */
export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCampaignRequest) => createCampaign(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

```

**Tool Call: Read file `src\app\hooks\useLabTests.ts`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\hooks\useLabTests.ts
// ═══════════════════════════════════════════════════════════
// React Query hooks — Lab (tests, samples, results)
// ═══════════════════════════════════════════════════════════
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchLabTests, submitLabTestResult,
  fetchSamples, fetchTestResults,
} from '../api/lab';

/** Fetch all lab tests (pending + completed) */
export function useLabTests() {
  return useQuery({
    queryKey: ['lab-tests'],
    queryFn: fetchLabTests,
  });
}

/** Submit screening result for a lab test */
export function useSubmitLabResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ testId, result }: {
      testId: string;
      result: {
        confirmedBloodType: string;
        hcv: 'negative' | 'positive';
        hbv: 'negative' | 'positive';
        syphilis: 'negative' | 'positive';
        hiv: 'negative' | 'positive';
        notes: string;
        suitable: boolean;
      };
    }) => submitLabTestResult(testId, result),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lab-tests'] });
      qc.invalidateQueries({ queryKey: ['samples'] });
      qc.invalidateQueries({ queryKey: ['test-results'] });
      qc.invalidateQueries({ queryKey: ['bags'] });
    },
  });
}

/** Fetch all samples */
export function useSamples() {
  return useQuery({
    queryKey: ['samples'],
    queryFn: fetchSamples,
  });
}

/** Fetch all test results */
export function useTestResults() {
  return useQuery({
    queryKey: ['test-results'],
    queryFn: fetchTestResults,
  });
}

```

**Tool Call: Read file `src\app\App.tsx`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\App.tsx
import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { router } from "./routes";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { InventoryProvider } from "./contexts/InventoryContext";
import { AppointmentProvider } from "./contexts/AppointmentContext";
import "../styles/fonts.css";

// ── React Query client ─────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,       // Data considered fresh for 5 min
      retry: 2,                         // Retry failed requests twice
      refetchOnWindowFocus: false,      // Don't refetch when tab re-focused
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <InventoryProvider>
            <AppointmentProvider>
              <RouterProvider router={router} />
            </AppointmentProvider>
          </InventoryProvider>
        </ThemeProvider>
      </AuthProvider>
      {/* Dev-only panel — inspect cache, queries, mutations */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**Tool Call: Read file `src\app\routes.tsx`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\routes.tsx
import { createBrowserRouter, Navigate, Outlet, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './components/auth/LoginPage';
import AdminLayout from './components/layout/AdminLayout';
import DoctorLayout from './components/layout/DoctorLayout';
import LabLayout from './components/layout/LabLayout';
import InventoryLayout from './components/layout/InventoryLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminDonors from './components/admin/AdminDonors';
import AdminStaff from './components/admin/AdminStaff';
import AdminCampaigns from './components/admin/AdminCampaigns';
import AdminInventory from './components/admin/AdminInventory';
import AdminReports from './components/admin/AdminReports';
import AdminSettings from './components/admin/AdminSettings';
import AdminInventoryAlerts from './components/admin/AdminInventoryAlerts';
import DoctorDashboard from './components/doctor/DoctorDashboard';
import DoctorDonors from './components/doctor/DoctorDonors';
import DonorRegistrationForm from './components/doctor/DonorRegistrationForm';
import DoctorCampaigns from './components/doctor/DoctorCampaigns';
import DoctorAppointments from './components/doctor/DoctorAppointments';
import DoctorEligibility from './components/doctor/DoctorEligibility';
import LabDashboard from './components/lab/LabDashboard';
import LabResults from './components/lab/LabResults';
import InventoryDashboard from './components/inventory/InventoryDashboard';
import InventoryBags from './components/inventory/InventoryBags';
import InventoryHistory from './components/inventory/InventoryHistory';
import InventoryDisposal from './components/inventory/InventoryDisposal';

// Root layout — providers live in App.tsx above RouterProvider
function RootLayout() {
  return (
    <div dir="rtl" className="min-h-screen" style={{ fontFamily: "'Tajawal', sans-serif" }}>
      <Outlet />
    </div>
  );
}

const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
    <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
        </svg>
      </div>
      <h2 className="text-gray-900 mb-2" style={{ fontSize: '20px', fontWeight: 700 }}>غير مصرح بالدخول</h2>
      <p className="text-gray-500" style={{ fontSize: '14px' }}>ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
    </div>
  </div>
);

function RootRedirect() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login', { replace: true });
    else if (user.role === 'admin') navigate('/admin', { replace: true });
    else if (user.role === 'lab') navigate('/lab', { replace: true });
    else if (user.role === 'inventory') navigate('/inventory', { replace: true });
    else navigate('/doctor', { replace: true });
  }, [user, navigate]);

  return null;
}

function AdminGuard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!user) navigate('/login', { replace: true }); }, [user, navigate]);
  if (!user) return null;
  if (user.role !== 'admin') return <UnauthorizedPage />;
  return <Outlet />;
}

function DoctorGuard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!user) navigate('/login', { replace: true }); }, [user, navigate]);
  if (!user) return null;
  if (user.role !== 'doctor') return <UnauthorizedPage />;
  return <Outlet />;
}

function LabGuard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!user) navigate('/login', { replace: true }); }, [user, navigate]);
  if (!user) return null;
  if (user.role !== 'lab') return <UnauthorizedPage />;
  return <Outlet />;
}

function InventoryGuard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!user) navigate('/login', { replace: true }); }, [user, navigate]);
  if (!user) return null;
  if (user.role !== 'inventory') return <UnauthorizedPage />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      { path: '/', Component: RootRedirect },
      { path: '/login', Component: LoginPage },
      {
        path: '/admin',
        Component: AdminGuard,
        children: [
          {
            Component: AdminLayout,
            children: [
              { index: true, Component: AdminDashboard },
              { path: 'donors', Component: AdminDonors },
              { path: 'staff', Component: AdminStaff },
              { path: 'campaigns', Component: AdminCampaigns },
              { path: 'inventory', Component: AdminInventory },
              { path: 'reports', Component: AdminReports },
              { path: 'settings', Component: AdminSettings },
            ],
          },
        ],
      },
      {
        path: '/doctor',
        Component: DoctorGuard,
        children: [
          {
            Component: DoctorLayout,
            children: [
              { index: true, Component: DoctorDashboard },
              { path: 'donors', Component: DoctorDonors },
              { path: 'register', Component: DonorRegistrationForm },
              { path: 'campaigns', Component: DoctorCampaigns },
              { path: 'appointments', Component: DoctorAppointments },
              { path: 'eligibility', Component: DoctorEligibility },
            ],
          },
        ],
      },
      {
        path: '/lab',
        Component: LabGuard,
        children: [
          {
            Component: LabLayout,
            children: [
              { index: true, Component: LabDashboard },
              { path: 'results', Component: LabResults },
            ],
          },
        ],
      },
      {
        path: '/inventory',
        Component: InventoryGuard,
        children: [
          {
            Component: InventoryLayout,
            children: [
              { index: true, Component: InventoryDashboard },
              { path: 'bags', Component: InventoryBags },
              { path: 'history', Component: InventoryHistory },
              { path: 'disposal', Component: InventoryDisposal },
              { path: 'inventory-alerts', Component: AdminInventoryAlerts },
            ],
          },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
```

## Assistant

<thinking>
Now I have a comprehensive picture of the project. Let me also check a few more component files quickly to understand the state of component refactoring and form implementations.
</thinking>

Let me check a few more critical files:

**Tool Call: Read file `src\app\components\admin\AdminEmergency.tsx` (lines 1-30)**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\components\admin\AdminEmergency.tsx
import { useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Phone, MapPin, Clock, Droplets, X, Send } from 'lucide-react';
import { emergencyRequests } from '../../data/mockData';

type EmReq = typeof emergencyRequests[0];

const urgencyConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  critical: { label: 'طارئ جداً', color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-200' },
  high: { label: 'عالي', color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-200' },
  medium: { label: 'متوسط', color: 'text-yellow-700', bg: 'bg-yellow-100', border: 'border-yellow-200' },
};

function FulfillModal({ request, onClose }: { request: EmReq; onClose: () => void }) {
  const [units, setUnits] = useState(request.units);
  const [note, setNote] = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#C62828] to-[#B71C1C] p-6 flex items-center justify-between">
          <div>
            <h3 className="text-white" style={{ fontSize: '18px', fontWeight: 700 }}>تلبية الطلب الطارئ</h3>
            <p className="text-red-200" style={{ fontSize: '13px' }}>{request.hospital}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <div className="flex items-center gap-3">

```

**Tool Call: Read file `src\app\components\admin\AdminStaff.tsx` (lines 1-50)**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\components\admin\AdminStaff.tsx
import { useState } from 'react';
import {
  UserPlus, Search, Trash2, Copy, Check, X, Eye, EyeOff,
  ChevronDown, FlaskConical, Stethoscope, Phone, MapPin, CreditCard, User as UserIcon, Mail, Package
} from 'lucide-react';
import { users as initialUsers, User, CITIES } from '../../data/mockData';
import { useStaff, useCreateStaff, useDeleteStaff } from '../../hooks/useStaff';
import { PageLoader, ErrorState } from '../shared/LoadingSkeleton';

type StaffRole = 'doctor' | 'lab' | 'inventory';

const roleConfig: Record<StaffRole, { label: string; badge: string; prefix: string; color: string; borderColor: string; bgColor: string; icon: any }> = {
  doctor:    { label: 'طبيب', badge: 'bg-teal-100 text-teal-700', prefix: 'dr', color: 'text-teal-700', borderColor: 'border-teal-200', bgColor: 'bg-teal-50', icon: Stethoscope },
  lab:       { label: 'دكتور تحاليل', badge: 'bg-green-100 text-green-700', prefix: 'lab', color: 'text-green-700', borderColor: 'border-green-200', bgColor: 'bg-green-50', icon: FlaskConical },
  inventory: { label: 'أمين مخزن', badge: 'bg-blue-100 text-blue-700', prefix: 'inv', color: 'text-blue-700', borderColor: 'border-blue-200', bgColor: 'bg-blue-50', icon: Package },
};

interface StaffForm {
  fullName: string;
  nationalId: string;
  phone: string;
  address: string;
  city: string;
  email: string;
  password: string;
  role: StaffRole;
}

const initialForm: StaffForm = {
  fullName: '', nationalId: '', phone: '', address: '', city: 'بني سويف',
  email: '', password: '', role: 'doctor',
};

export default function AdminStaff() {
  const { data: staffData = [], isLoading, isError } = useStaff();
  const createStaff = useCreateStaff();
  const deleteStaff = useDeleteStaff();

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState<StaffForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const staff = staffData.filter(u => u.role !== 'admin');


```

**Tool Call: Read file `src\app\components\admin\AdminDashboard.tsx` (lines 1-30)**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\components\admin\AdminDashboard.tsx
import { useNavigate } from 'react-router';
import { Users, Megaphone, UserCog, Droplets, TrendingUp, AlertTriangle, ArrowUpRight, Heart, Building2, Smartphone } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useDonors } from '../../hooks/useDonors';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useStaff } from '../../hooks/useStaff';
import { useBloodInventory, useMonthlyStats } from '../../hooks/useInventory';
import { PageLoader, ErrorState } from '../shared/LoadingSkeleton';

const donationTypeLabels: Record<string, string> = { whole: 'دم كامل', plasma: 'بلازما', platelets: 'صفائح' };
const statusColors: Record<string, string> = { eligible: 'bg-green-100 text-green-700', ineligible: 'bg-red-100 text-red-700', deferred: 'bg-orange-100 text-orange-700' };
const statusLabels: Record<string, string> = { eligible: 'مؤهل', ineligible: 'غير مؤهل', deferred: 'موجل' };
const bloodStatusColor: Record<string, string> = { normal: 'bg-green-500', low: 'bg-yellow-500', critical: 'bg-red-500' };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── React Query hooks ────────────────────────────────────
  const { data: donors = [], isLoading: loadingDonors, isError: errorDonors, refetch: refetchDonors } = useDonors();
  const { data: campaignsData = [], isLoading: loadingCampaigns } = useCampaigns();
  const { data: staffData = [], isLoading: loadingStaff } = useStaff();
  const { data: bloodInventory = [], isLoading: loadingInventory } = useBloodInventory();
  const { data: monthlyStatsData = [], isLoading: loadingStats } = useMonthlyStats();

  const isLoading = loadingDonors || loadingCampaigns || loadingStaff || loadingInventory || loadingStats;

  if (isLoading) return <PageLoader message="جاري تحميل لوحة التحكم..." />;
  if (errorDonors) return <ErrorState message="تعذر تحميل بيانات المتبرعين" onRetry={() => refetchDonors()} />;

```

**Tool Call: Search files for regex `type\s+\w+\s*=\s*any|:\s*any[,;\s\)]`**
Status: Completed

Found 20 matches:

## Matches in Blood-Bank-System\src\app\components\admin\AdminAnalytics.tsx

### const CustomTooltip › L18-26

```
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-3" dir="rtl">
        <p className="text-[#1E293B] mb-1" style={{ fontSize: '13px', fontWeight: 600 }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color, fontSize: '12px' }}>{p.name}: {p.value}</p>
        ))}
      </div>
```

4 lines remaining in ancestor node. Read the file to see all.

## Matches in Blood-Bank-System\src\app\components\admin\AdminCampaigns.tsx

### function AdminCampaigns() › const filtered › L12-22

```
export default function AdminCampaigns() {
  const { data: campaigns = [], isLoading, isError, refetch } = useCampaigns();
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState<any | null>(null);

  if (isLoading) return <PageLoader message="جاري تحميل الحملات..." />;
  if (isError) return <ErrorState message="تعذر تحميل الحملات" onRetry={() => refetch()} />;

  const filtered = campaigns.filter((c: any) => !filterStatus || c.status === filterStatus);

  return (
```

131 lines remaining in ancestor node. Read the file to see all.

## Matches in Blood-Bank-System\src\app\components\admin\AdminDashboard.tsx

### function AdminDashboard() › const doctors › L31-47

```

  // ── Derived data ─────────────────────────────────────────
  const doctors = staffData.filter((u: any) => u.role === 'doctor');
  const labDoctors = staffData.filter((u: any) => u.role === 'lab');
  const totalUnits = bloodInventory.reduce((s: number, b: any) => s + b.units, 0);
  const criticalCount = bloodInventory.filter((b: any) => b.status === 'critical').length;
  const recentDonors = [...donors].sort((a: any, b: any) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()).slice(0, 6);
  const campaignDonors = donors.filter((d: any) => d.source === 'campaign');
  const walkinDonors = donors.filter((d: any) => d.source === 'walkin');
  const appDonors = donors.filter((d: any) => d.source === 'app');

  const stats = [
    { label: 'إجمالي المتبرعين', value: donors.length, sub: `${donors.filter((d: any) => d.status === 'eligible').length} مؤهل`, icon: Heart, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', action: () => navigate('/admin/donors') },
    { label: 'حملات التبرع', value: campaignsData.length, sub: `${campaignsData.filter((c: any) => c.status === 'active').length} نشطة`, icon: Megaphone, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', action: () => navigate('/admin/campaigns') },
    { label: 'الكوادر الطبية', value: doctors.length + labDoctors.length, sub: `${doctors.length} طبيب • ${labDoctors.length} تحاليل`, icon: UserCog, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', action: () => navigate('/admin/staff') },
    { label: 'وحدات الدم المتاحة', value: totalUnits, sub: `${criticalCount} فصائل حرجة`, icon: Droplets, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', action: () => navigate('/admin/inventory') },
  ];
```

### function AdminDashboard() › L147-157

```
          <div className="space-y-3">
            {bloodInventory.map((b: any) => (
              <div key={`inv-${b.type}`} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600" style={{ fontSize: '12px', fontWeight: 800 }}>{b.type}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700" style={{ fontSize: '12px', fontWeight: 600 }}>{b.units} وحدة</span>
                    <span className={`px-2 py-0.5 rounded-full text-white ${bloodStatusColor[b.status]}`} style={{ fontSize: '10px', fontWeight: 700 }}>
                      {b.status === 'normal' ? 'طبيعي' : b.status === 'low' ? 'منخفض' : 'حرج'}
```

9 lines remaining in ancestor node. Read the file to see all.

### function AdminDashboard() › L189-199

```
              <tbody className="divide-y divide-gray-50">
                {recentDonors.map((d: any) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3"><span className="font-mono text-green-600 bg-green-50 px-2 py-0.5 rounded" style={{ fontSize: '11px', fontWeight: 700 }}>{d.donorCode}</span></td>
                    <td className="px-4 py-3"><span className="text-gray-900" style={{ fontSize: '13px', fontWeight: 600 }}>{d.name}</span></td>
                    <td className="px-4 py-3"><span className="text-gray-500" style={{ fontSize: '13px' }}>{d.city}</span></td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-red-50 text-red-600 rounded" style={{ fontSize: '12px', fontWeight: 700 }}>{d.bloodType}</span></td>
                    <td className="px-4 py-3"><span className="text-gray-500" style={{ fontSize: '12px' }}>{donationTypeLabels[d.donationType]}</span></td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full ${d.status === 'eligible' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
```

10 lines remaining in ancestor node. Read the file to see all.

### function AdminDashboard() › L217-227

```
          <div className="space-y-3">
            {bloodInventory.filter((b: any) => b.status !== 'normal').map((b: any) => (
              <div key={`alert-${b.type}`} className={`flex items-start gap-3 p-3 rounded-xl ${b.status === 'critical' ? 'bg-red-50 border border-red-100' : 'bg-yellow-50 border border-yellow-100'}`}>
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${b.status === 'critical' ? 'text-red-500' : 'text-yellow-500'}`} />
                <div>
                  <p className={`${b.status === 'critical' ? 'text-red-700' : 'text-yellow-700'}`} style={{ fontSize: '13px', fontWeight: 600 }}>
                    مخزون {b.type} {b.status === 'critical' ? 'حرج' : 'منخفض'}
                  </p>
                  <p className={`${b.status === 'critical' ? 'text-red-500' : 'text-yellow-600'}`} style={{ fontSize: '12px' }}>
                    متبقي {b.units} وحدات (الحد الأدنى: {b.minRequired})
                  </p>
```

18 lines remaining in ancestor node. Read the file to see all.

## Matches in Blood-Bank-System\src\app\components\admin\AdminDonors.tsx

### type Donor › L1-11

```
import { useState } from 'react';
import { Search, Filter, Edit2, X, Save, ChevronDown, Building2, Smartphone } from 'lucide-react';
import { BLOOD_TYPES, CITIES } from '../../data/mockData';
import { useDonors } from '../../hooks/useDonors';
import { PageLoader, ErrorState } from '../shared/LoadingSkeleton';

type Donor = any;

const statusColors: Record<string, string> = { eligible: 'bg-green-100 text-green-700', ineligible: 'bg-red-100 text-red-700', deferred: 'bg-orange-100 text-orange-700' };
const statusLabels: Record<string, string> = { eligible: 'مؤهل', ineligible: 'غير مؤهل', deferred: 'موجل' };
const donationTypeLabels: Record<string, string> = { whole: 'دم كامل', plasma: 'بلازما', platelets: 'صفائح' };
```

238 lines remaining in ancestor node. Read the file to see all.

## Matches in Blood-Bank-System\src\app\components\admin\AdminInventory.tsx

### function AdminInventory() › L98-107

```
              <Bar
                key="bar-units"
                dataKey="units"
                radius={[6, 6, 0, 0]}
                shape={(props: any) => {
                  const { x, y, width, height, index } = props;
                  const item = inventory[index];
                  return <rect x={x} y={y} width={width} height={Math.max(height, 0)} rx={6} ry={6} fill={barColors[item?.status ?? 'normal']} />;
                }}
              />
```

## Matches in Blood-Bank-System\src\app\components\admin\AdminInventoryAlerts.tsx

### function AdminInventoryAlerts() › const init › L19-23

```
  const [thresholds, setThresholds] = useState<Record<BloodType, number>>(() => {
    const init: any = {};
    bloodInventory.forEach(b => { init[b.type] = b.minRequired; });
    return init;
  });
```

## Matches in Blood-Bank-System\src\app\components\admin\AdminStaff.tsx

### const roleConfig › L12-16

```
const roleConfig: Record<StaffRole, { label: string; badge: string; prefix: string; color: string; borderColor: string; bgColor: string; icon: any }> = {
  doctor:    { label: 'طبيب', badge: 'bg-teal-100 text-teal-700', prefix: 'dr', color: 'text-teal-700', borderColor: 'border-teal-200', bgColor: 'bg-teal-50', icon: Stethoscope },
  lab:       { label: 'دكتور تحاليل', badge: 'bg-green-100 text-green-700', prefix: 'lab', color: 'text-green-700', borderColor: 'border-green-200', bgColor: 'bg-green-50', icon: FlaskConical },
  inventory: { label: 'أمين مخزن', badge: 'bg-blue-100 text-blue-700', prefix: 'inv', color: 'text-blue-700', borderColor: 'border-blue-200', bgColor: 'bg-blue-50', icon: Package },
};
```

## Matches in Blood-Bank-System\src\app\components\admin\AdminUsers.tsx

### type Donor › L16-20

```
import { PageLoader, ErrorState } from "../shared/LoadingSkeleton";

type Donor = any;

const bloodTypeColors: Record<string, string> = {
```

### function AdminUsers() › const filtered › L155-159

```
    );

  const filtered = donors.filter((d: any) => {
    const matchSearch = d.name.includes(search) || d.city.includes(search);
    const matchBlood = bloodFilter === "all" || d.bloodType === bloodFilter;
```

## Matches in Blood-Bank-System\src\app\components\doctor\DoctorDashboard.tsx

### function DoctorDashboard() › const myDonors › L23-33

```
  if (isError) return <ErrorState message="تعذر تحميل البيانات" onRetry={() => refetch()} />;

  const myDonors = donors.filter((d: any) => d.registeredBy === user?.id);
  const activeCampaigns = campaigns.filter((c: any) => c.status === 'active');
  const myCampaigns = campaigns.filter((c: any) => c.createdBy === user?.id);
  const walkinToday = donors.filter((d: any) => d.registeredAt === '2025-04-26' && d.source === 'walkin').length;
  const appToday = donors.filter((d: any) => d.registeredAt === '2025-04-26' && d.source === 'app').length;
  const campaignToday = donors.filter((d: any) => d.registeredAt === '2025-04-26' && d.source === 'campaign').length;
  const campaignDonors = donors.filter((d: any) => d.source === 'campaign');

  // Today's upcoming appointments (13:00 onwards — simulated current time 10:30)
```

## Matches in Blood-Bank-System\src\app\components\doctor\DoctorDonors.tsx

### type Donor › L1-11

```
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { UserPlus, Search, Eye, ChevronDown, X, Building2, Smartphone, Megaphone, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { BLOOD_TYPES, CITIES } from '../../data/mockData';
import { useDonors } from '../../hooks/useDonors';
import { PageLoader, ErrorState } from '../shared/LoadingSkeleton';

type Donor = any;
type BloodType = string;

const statusColors: Record<string, string> = {
```

288 lines remaining in ancestor node. Read the file to see all.

### function DoctorDonors() › const filtered › L34-38

```
  if (isError) return <ErrorState message="تعذر تحميل بيانات المتبرعين" onRetry={() => refetch()} />;

  const filtered = donors.filter((d: any) => {
    const matchSearch = d.name.includes(search) || d.donorCode.includes(search) || d.phone.includes(search);
    const matchBlood = !filterBlood || d.bloodType === filterBlood;
```

## Matches in Blood-Bank-System\src\app\components\doctor\DonorRegistrationForm.tsx

### function DonorRegistrationForm() › const updateField › L107-111

```
  const activeCampaigns = campaigns.filter(c => c.status === 'active');

  const updateField = (key: keyof SimpleForm, value: any) => {
    setForm(p => ({ ...p, [key]: value }));
    setErrors(p => { const e = { ...p }; delete e[key]; return e; });
```

## Matches in Blood-Bank-System\src\app\components\layout\AdminLayout.tsx

### function AdminLayout() › const criticalItems › L21-31

```
export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const { data: bloodInventory = [] } = useBloodInventory();
  const criticalItems = bloodInventory.filter((b: any) => b.status === 'critical');
  const lowItems = bloodInventory.filter((b: any) => b.status === 'low');

  const notifications: Notification[] = [
```

151 lines remaining in ancestor node. Read the file to see all.

## Matches in Blood-Bank-System\src\app\components\layout\DoctorLayout.tsx

### function DoctorLayout() › const activeCampaigns › L21-31

```
export default function DoctorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const { data: donors = [] } = useDonors();
  const { data: campaigns = [] } = useCampaigns();
  const activeCampaigns = campaigns.filter((c: any) => c.status === 'active');
  const todayDonors = donors.filter((d: any) => d.registeredAt === '2025-04-26');

```

144 lines remaining in ancestor node. Read the file to see all.

## Matches in Blood-Bank-System\src\app\components\layout\LabLayout.tsx

### function LabLayout() › const pendingTests › L13-23

```
export default function LabLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const { data: labTests = [] } = useLabTests();
  const pendingTests = labTests.filter((t: any) => t.status === 'pending');
  const pendingCount = pendingTests.length;

  const notifications: Notification[] = pendingTests.map(t => ({
```

152 lines remaining in ancestor node. Read the file to see all.

## Matches in Blood-Bank-System\src\app\contexts\AuthContext.tsx

### function AuthProvider( ) › const login › L29-39

```
    try {
      setIsLoading(true);
      const { token, user: loggedInUser } = await loginApi({ email, password });

      // Persist token + user
      localStorage.setItem('bloodlink_token', token);
      localStorage.setItem('bloodlink_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);

      return { success: true };
    } catch (err: any) {
```

7 lines remaining in ancestor node. Read the file to see all.

**Tool Call: Search files for regex `useState.*password|password.*useState|setPassword|password.*string`**
Status: Completed

Found 12 matches:

## Matches in Blood-Bank-System\src\app\components\admin\AdminSettings.tsx

### function AdminSettings() › const passwords › L6-16

```
export default function AdminSettings() {
  const { user } = useAuth();
  const { isDark, toggleDark } = useTheme();
  const [activeTab, setActiveTab] = useState('system');
  const [saved, setSaved] = useState(false);
  const [sysInfo, setSysInfo] = useState({
    hospitalName: 'مستشفى بني سويف العام', governorate: 'بني سويف', phone: '082-2320000',
    email: 'info@bsgh.gov.eg', workingHours: '8:00 صباحاً - 4:00 مساءً',
  });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [passError, setPassError] = useState('');
```

282 lines remaining in ancestor node. Read the file to see all.

### function AdminSettings() › const handleChangePassword › L26-35

```
  const handleChangePassword = () => {
    setPassError('');
    if (!passwords.current) { setPassError('أدخل كلمة المرور الحالية'); return; }
    if (passwords.current !== (user as any)?.password) { setPassError('كلمة المرور الحالية غير صحيحة'); return; }
    if (passwords.newPass.length < 6) { setPassError('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'); return; }
    if (passwords.newPass !== passwords.confirm) { setPassError('كلمات المرور غير متطابقة'); return; }
    setSaved(true);
    setPasswords({ current: '', newPass: '', confirm: '' });
    setTimeout(() => setSaved(false), 2000);
  };
```

### function AdminSettings() › L120-123

```
                    <input type="password" value={passwords[f.key as keyof typeof passwords]}
                      onChange={e => setPasswords(p => ({...p, [f.key]: e.target.value}))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                      style={{ fontSize: '13px' }} />
```

## Matches in Blood-Bank-System\src\app\components\admin\AdminStaff.tsx

### interface StaffForm › L18-27

```
interface StaffForm {
  fullName: string;
  nationalId: string;
  phone: string;
  address: string;
  city: string;
  email: string;
  password: string;
  role: StaffRole;
}
```

## Matches in Blood-Bank-System\src\app\components\auth\LoginPage.tsx

### function LoginPage() › const password › L74-84

```
export default function LoginPage() {
  const navigate  = useNavigate();
  const { login, user } = useAuth();

  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [activeRole,  setActiveRole]  = useState<typeof demoAccounts[0] | null>(null);

```

407 lines remaining in ancestor node. Read the file to see all.

### function LoginPage() › const fillDemo › L96-101

```
  const fillDemo = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setActiveRole(acc);
    setError('');
  };
```

### function LoginPage() › L404-414

```
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pr-10 pl-11 py-3.5 rounded-xl border outline-none transition-all"
                  style={{
                    fontSize: '14px',
                    background: '#f9fafb',
```

14 lines remaining in ancestor node. Read the file to see all.

## Matches in Blood-Bank-System\src\app\components\mobile\MobileApp.tsx

### function LoginScreen( ) › const password › L23-33

```
function LoginScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [email, setEmail] = useState('donor@bloodbank.sa');
  const [password, setPassword] = useState('Donor@2025');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    onNavigate('home');
  };
```

58 lines remaining in ancestor node. Read the file to see all.

### function LoginScreen( ) › L64-69

```
          <div>
            <label className="block text-[#374151] mb-1.5" style={{ fontSize: '13px', fontWeight: 600 }}>كلمة المرور</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#C62828] shadow-sm"
              style={{ fontSize: '13px' }} dir="ltr" />
          </div>
```

### function RegisterScreen( ) › L93-103

```
function RegisterScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', phone: '', bloodType: 'O+', age: '', city: 'الرياض', email: '', password: '' });

  return (
    <div className="flex flex-col h-full bg-[#F8F9FC]">
      <div className="bg-gradient-to-r from-[#C62828] to-[#B71C1C] px-6 pt-10 pb-6">
        <button onClick={() => step > 1 ? setStep(step - 1) : onNavigate('login')} className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mb-4">
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div className="flex gap-2 mb-4">
```

79 lines remaining in ancestor node. Read the file to see all.

## Matches in Blood-Bank-System\src\app\contexts\AuthContext.tsx

### interface AuthContextType › L6-11

```
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}
```

### function AuthProvider( ) › const login › L26-30

```
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
```

## Assistant

<thinking>
Now I have a comprehensive view of the entire codebase. Let me also check if there's an `.env` file and the `vite.config.ts`.
</thinking>

Let me check the environment setup and a few final details:

**Tool Call: Read file `vite.config.ts`**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\vite.config.ts
import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})

```

**Tool Call: 1 match**
Status: Completed

file://D:\Graduation!!!\Blood-Bank-System\.env

**Tool Call: Read file `src\app\components\admin\AdminSettings.tsx` (lines 26-36)**
Status: Completed

```D:\Graduation!!!\Blood-Bank-System\src\app\components\admin\AdminSettings.tsx
  const handleChangePassword = () => {
    setPassError('');
    if (!passwords.current) { setPassError('أدخل كلمة المرور الحالية'); return; }
    if (passwords.current !== (user as any)?.password) { setPassError('كلمة المرور الحالية غير صحيحة'); return; }
    if (passwords.newPass.length < 6) { setPassError('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'); return; }
    if (passwords.newPass !== passwords.confirm) { setPassError('كلمات المرور غير متطابقة'); return; }
    setSaved(true);
    setPasswords({ current: '', newPass: '', confirm: '' });
    setTimeout(() => setSaved(false), 2000);
  };


```

**Tool Call: Read file `.env`**
Status: Failed

```json
{
  "Text": "Cannot read file because its path matches the global `private_files` setting: D:\\Graduation!!!\\Blood-Bank-System\\.env"
}
```

**Tool Call: Search files for regex `ErrorBoundary|error.*boundary|class.*Error.*extends`**
Status: Completed

No matches found

**Tool Call: Search files for regex `useForm|register\(|handleSubmit.*useForm|Controller|zodResolver|yupResolver`**
Status: Completed

Found 14 matches:

## Matches in Blood-Bank-System\src\app\components\doctor\DoctorAppointments.tsx

### function AppointmentRow( ) › L256-260

```
            <button
              onClick={e => { e.stopPropagation(); onRegister(); }}
              title="بدء التسجيل"
              className="p-1.5 border border-green-200 text-green-600 rounded-lg hover:bg-green-50 transition-all"
            >
```

### function DoctorAppointments() › const renderToday › L396-400

```
                <AppointmentCard
                  slot={slot}
                  onRegister={() => handleRegister(slot)}
                  onCancel={() => handleCancel(slot)}
                />
```

### function DoctorAppointments() › const renderWeek › L443-448

```
                  <AppointmentRow
                    key={slot.id}
                    slot={slot}
                    onRegister={() => handleRegister(slot)}
                    onCancel={() => handleCancel(slot)}
                  />
```

### function DoctorAppointments() › const renderMonth › L483-488

```
                  <AppointmentRow
                    key={slot.id}
                    slot={slot}
                    onRegister={() => handleRegister(slot)}
                    onCancel={() => handleCancel(slot)}
                  />
```

## Matches in Blood-Bank-System\src\app\components\inventory\InventoryHistory.tsx

### function InventoryHistory() › const filterController › L128-148

```
export default function InventoryHistory() {
  const { data: outflowRecords = [], isLoading: isLoadingOutflow, isError: isErrorOutflow } = useOutflowRecords();
  const { data: bags = [], isLoading: isLoadingBags, isError: isErrorBags } = useBloodBags();
  const [filterAction, setFilterAction] = useState<OutflowActionType | 'all'>('all');
  const [filterController, setFilterController] = useState('');
  const [filterBloodType, setFilterBloodType] = useState<BloodType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [detailRecord, setDetailRecord] = useState<OutflowRecord | null>(null);

  if (isLoadingBags || isLoadingOutflow) return <PageLoader />;
  if (isErrorBags || isErrorOutflow) return <ErrorState message="فشل في تحميل سجل الصادر، يرجى المحاولة لاحقاً" onRetry={() => window.location.reload()} />;

  const controllers = [...new Set(outflowRecords.map(r => r.performedByName))];

  const filtered = outflowRecords.filter(r => {
    if (filterAction !== 'all' && r.actionType !== filterAction) return false;
    if (filterController && r.performedByName !== filterController) return false;
    if (filterBloodType !== 'all' && r.bloodType !== filterBloodType) return false;
    if (search && !r.bagCode.includes(search) && !r.bloodType.includes(search) && !(r.recipientName ?? '').includes(search)) return false;
    return true;
  });
```

158 lines remaining in ancestor node. Read the file to see all.

### function InventoryHistory() › L229-246

```
        <div className="flex flex-wrap gap-2 items-center">
          {([['all', 'الكل'], ['exported', 'تصدير فقط'], ['disposed', 'إتلاف فقط']] as [OutflowActionType | 'all', string][]).map(([val, label]) => (
            <button key={val} onClick={() => setFilterAction(val)}
              className={`px-4 py-2 rounded-xl transition-all ${filterAction === val ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              style={{ fontSize: '13px', fontWeight: 600 }}>{label}</button>
          ))}
          {controllers.length > 1 && (
            <select value={filterController} onChange={e => setFilterController(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-gray-700 outline-none" style={{ fontSize: '13px' }}>
              <option value="">كل المنفذين</option>
              {controllers.map(c => <option key={c} value={c}>{c.split(' ').slice(1, 3).join(' ')}</option>)}
            </select>
          )}
          {(filterAction !== 'all' || filterController || filterBloodType !== 'all' || search) && (
            <button
              onClick={() => { setFilterAction('all'); setFilterController(''); setFilterBloodType('all'); setSearch(''); }}
              className="px-3 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-200 rounded-xl transition-all"
              style={{ fontSize: '12px', fontWeight: 600 }}>
```

4 lines remaining in ancestor node. Read the file to see all.

## Matches in Blood-Bank-System\src\app\components\ui\form.tsx

### L6-14

```
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
```

### const FormField › L32-41

```
const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
```

2 lines remaining in ancestor node. Read the file to see all.

### const useFormField › L45-54

```
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }
```

12 lines remaining in ancestor node. Read the file to see all.

### function FormLabel( ) › L93-103

```
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
```

2 lines remaining in ancestor node. Read the file to see all.

### function FormControl( ) › L108-109

```
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();
```

### function FormDescription( ) › L126-136

```
function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
```

1 lines remaining in ancestor node. Read the file to see all.

### function FormMessage( ) › L139-149

```
function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : props.children;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
```

8 lines remaining in ancestor node. Read the file to see all.

### L159-168

```
export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
```

## Assistant

<thinking>
Now I have a comprehensive picture of the entire project. Let me compile the full audit report based on what I've found:

## Findings Summary:

### 1. **UI/UX - Loading States, Skeleton Screens, Empty States**

**Good:**

- `LoadingSkeleton.tsx` exists with `PageLoader`, `ErrorState`, `CardSkeleton`, `TableSkeleton` components
- `AdminDashboard`, `DoctorDonors`, `AdminDonors`, `LabDashboard`, `InventoryBags`, `InventoryDisposal`, `InventoryHistory`, etc. all use `PageLoader` and `ErrorState`

- **Issues:**
- No `ErrorBoundary` class component exists anywhere—only manual `ErrorState` checks
- The `TableSkeleton` and `CardSkeleton` components are defined but not actually being used; pages show a generic `PageLoader` spinner instead of content-shaped skeletons
- Empty states lack a consistent pattern when tables have no data

### 2. **TypeScript Integrity**

I'm noticing several type safety issues scattered throughout the codebase. Components like `AdminDonors.tsx` and `DoctorDonors.tsx` define local type aliases (`Donor` as `any`, `BloodType` as `string`) instead of importing from the shared types file. The mock user data in `auth.ts` and `staff.ts` includes passwords for internal use, which is fine since the `User` type itself doesn't expose that field, but `AdminSettings.tsx` is casting `user as any` to access a `.password` property that shouldn't exist on the type.

This is a real problem because if the app switches to a real API that never returns passwords, that client-side verification will break. There's also inconsistency in the lab test result structure—`LabTest.result` uses inline `hcv/hbv` fields while `TestResult` defines `hepatitisB/hepatitisC`, creating two different representations of the same data. Throughout the codebase, components are using generic `any` casts in filter callbacks and data operations instead of leveraging the proper types from the types directory.

Several admin components are still tightly coupled to mockData without any React Query hooks—`AdminAnalytics` pulls in donation trends and blood type distribution as static data, `AdminEmergency` imports emergency requests even though no emergency API service exists, and `AdminInventoryAlerts` directly uses mock blood inventory and monthly stats instead of fetching them. Meanwhile, `AdminStaff` and other components continue importing from mockData in ways that would break if the backend changes. Continuing through the remaining components, I see `DonorRegistrationForm.tsx` pulls `campaigns` and `slot15Data` directly from mockData, while the inventory-related files like `InventoryBags.tsx`, `InventoryDashboard.tsx`, `InventoryDisposal.tsx`, `InventoryHistory.tsx`, and `InventoryRequests.tsx` all import type definitions and constants from mockData but don't appear to use the actual data arrays.

Moving further down, `LabDashboard.tsx` and `LabResults.tsx` import test results and donor information directly from mockData, while `MobileApp.tsx` is completely static with hardcoded preview data, which is acceptable for its purpose. The context files are more problematic—`AppointmentContext.tsx` seeds its entire state from `slot15Data`, and `InventoryContext.tsx` imports both type definitions and actual data objects from mockData, creating a tight coupling between the context logic and the mock data layer.

Beyond the data imports, there's a structural issue where some components are pulling types like `BloodBag` and `OutflowActionType` directly from mockData instead of from the dedicated `types/` directory. Constants like `BLOOD_TYPES`, `CITIES`, `DISEASES`, and `HOSPITALS` are also scattered across mockData when they should live in a separate constants file. Several components including `DoctorEligibility`, `AdminAnalytics`, `AdminEmergency`, and `DonorRegistrationForm` still rely on static data arrays baked directly into their code.

I'm also noticing that `react-hook-form` is already installed and there's a wrapper component for it in the UI directory, so there's an opportunity to standardize form handling across the application. cn form component).

**But no forms use it!** All forms use manual `useState` logic:

1. `DonorRegistrationForm.tsx` — uses `useState<SimpleForm>`, manual `validate()`, manual error state `Record<string, string>`. BUT it does use `useCreateDonor()` mutation. So it's "mutation-ready" but not using react-hook-form.
2. `AdminStaff.tsx` — uses `useState<StaffForm>` with manual validation, has `useCreateStaff()` mutation.
3. `LoginPage.tsx` — uses `useState` for email/password, manual error state.
4. `AdminSettings.tsx` — uses `useState` for passwords with manual validation.
5. No form uses `useForm`, `Controller`, `zodResolver`, or `yupResolver`.

The `src/app/components/ui/form.tsx` is a Shadcn form component wrapper around react-hook-form, but it's completely unused across the codebase.

Now looking at integration readiness — there's no CORS configuration in the Vite config, so switching to a real API will likely hit cross-origin errors unless the backend allows it or I set up a proxy. The environment variable setup is also questionable: there's an `as any` cast on `import.meta.env.VITE_API_URL` which suggests uncertainty about whether the variable exists, and there's no `.env.example` file to document what's needed.

The token refresh logic is a major gap. The API client just redirects to login on any 401 response — there's no silent token refresh pattern. If the backend uses short-lived JWTs with refresh tokens, users will get logged out constantly instead of having their sessions renewed automatically.

There's also a state management conflict: `InventoryContext.tsx` manages its own local state for bags, transactions, and requests, while React Query is also caching the same data. When `USE_MOCK = false`, both systems try to be the source of truth, and components like `InventoryRequests.tsx` use both the context hook and React Query hooks simultaneously, which will cause inconsistencies.

Similar problems exist across other components — `AppointmentContext.tsx` initializes from hardcoded mock data instead of API responses, `AdminEmergency.tsx` has no API hook at all, `AdminAnalytics.tsx` pulls all chart data from mock files, `DoctorEligibility.tsx` loads donors from both mock and the API hook, and `LabResults.tsx` does the same with test results and samples. These will all break or show stale data when switching to live APIs.

There are also type and consistency issues: `AdminSettings.tsx` tries to access a `password` field that won't exist on real user objects, components import types directly from mockData instead of a proper types file, the `createDonor` mock doesn't actually update the mock donor list so new donors disappear on refresh, and `cancelAppointment` in the mock does nothing while the context manages cancellations separately — the two systems never sync.

Beyond the mocks themselves, there's missing form validation schemas (logic is duplicated across forms), no global toast notification system despite Sonner being installed, and the `import.meta.env` cast to `any` suggests the Vite TypeScript config might be missing proper environment variable typing. Additionally, `AdminStaff.tsx` imports the mock users directly which includes password fields, creating another type safety gap.
</thinking>

I now have a complete picture of the entire project. Let me write the comprehensive audit report.

---

# 🩸 BloodLink — Deep-Dive Architecture Audit

> **Scope:** Full project analysis of `src/app/{api,hooks,components,contexts,types,data}` across all roles (Admin, Doctor, Lab, Inventory).

---

## Executive Summary

The architectural backbone is **well-designed**: the API layer, React Query hooks, and types directory are correctly structured. However, there are **3 show-stopper critical issues** that will break the app immediately when `USE_MOCK = false`, plus a significant number of medium-priority gaps that should be closed before production. Below is the full breakdown.

---

## 🚨 Critical Issues — Show-Stoppers

These **will break** the moment you flip `USE_MOCK` to `false`.

---

### C-1: Dual State for Inventory — Context vs. React Query Divergence

**Files:** `InventoryContext.tsx`, `InventoryRequests.tsx`

`InventoryContext.tsx` manages its own local `useState` arrays for bags, transactions, requests, and outflow records — seeded directly from mockData arrays. `InventoryRequests.tsx` then imports **both** systems simultaneously:

```D:\Graduation!!!\Blood-Bank-System\src\app\components\inventory\InventoryRequests.tsx#L1-5
import { useInventory as useInventoryContext } from '../../contexts/InventoryContext';
// AND also:
import { useBloodBags, useHospitalRequests, useFulfillRequest } from '../../hooks/useInventory';
```

When `USE_MOCK = false`, `useHospitalRequests()` will fetch from the real API, but `useInventoryContext()` will still hold stale, local mock state. Any mutation performed through the context (`fulfillRequest`, `updateBagStatus`) will update the local state but not the server, and any mutation performed through the hooks will invalidate the React Query cache but not the context state. **The UI will show contradictory data within the same screen.**

**Fix:** `InventoryContext` must be fully removed and replaced by the React Query hooks. All context mutation logic should be moved into the corresponding `useMutation` calls in `useInventory.ts`.

---

### C-2: `AppointmentContext` Bypasses the Entire API Layer

**File:** `AppointmentContext.tsx`

```D:\Graduation!!!\Blood-Bank-System\src\app\contexts\AppointmentContext.tsx#L3-3
import { slot15Data, Slot15 } from '../data/mockData';
```

The context initializes state directly from the mockData import — it does not call `useSlot15Data()` or any hook. The `cancelAppointment` in the context mutates local state only. The `cancelAppointment` in `useAppointments.ts` (the React Query hook) calls the real API — but they are two completely separate systems that both exist simultaneously. The `DoctorAppointments.tsx` component uses the **context version**, meaning it will **never talk to your real backend**.

**Fix:** Delete `AppointmentContext.tsx`. `DoctorAppointments.tsx` should use `useSlot15Data()` for reads and `useCancelAppointment()` mutation for writes.

---

### C-3: `AdminSettings` Password Check Will Always Fail in Production

**File:** `AdminSettings.tsx`, line 29

```D:\Graduation!!!\Blood-Bank-System\src\app\components\admin\AdminSettings.tsx#L28-29
if (passwords.current !== (user as any)?.password) {
  setPassError('كلمة المرور الحالية غير صحيحة'); return;
}
```

The `User` type (correctly) has no `password` field. The real API will never return a password. This `(user as any)?.password` will always evaluate to `undefined`, making it impossible to ever pass the current-password check. The "Change Password" feature is completely broken for real backend integration.

**Fix:** The password change form needs a dedicated `POST /auth/change-password` API call that validates the current password **server-side**.

---

## 🔴 High Priority — Will Cause Immediate Failures

### H-1: Two Features Have No API Service Whatsoever

**Files:** `AdminEmergency.tsx`, `AdminAnalytics.tsx`

- **`AdminEmergency.tsx`** imports `emergencyRequests` directly from mockData with zero React Query hook, zero API service file, and zero endpoint definition. There is no `api/emergency.ts` and no `useEmergencyRequests` hook anywhere.
- **`AdminAnalytics.tsx`** imports all three of its datasets (`donationTrends`, `areaData`, `bloodTypeDistribution`) directly from mockData:

```D:\Graduation!!!\Blood-Bank-System\src\app\components\admin\AdminAnalytics.tsx#L7-7
import { donationTrends, areaData, bloodTypeDistribution } from '../../data/mockData';
```

When `USE_MOCK = false`, both pages will render empty charts/lists. There is no path from these components to the real backend.

---

### H-2: No Token Refresh Logic — Users Will Be Hard-Logged-Out

**File:** `api/client.ts`

```D:\Graduation!!!\Blood-Bank-System\src\app\api\client.ts#L28-35
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("bloodlink_token");
      localStorage.removeItem("bloodlink_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
```

This is the nuclear option: any 401 — including an expired access token — immediately destroys the session. If your backend issues short-lived JWTs (e.g., 15-minute expiry) with a refresh token, a user in the middle of filling out the `DonorRegistrationForm` (a 921-line multi-step form) will lose all their work on expiry. There is zero retry-after-refresh logic.

---

### H-3: No CORS Proxy in `vite.config.ts`

**File:** `vite.config.ts`

The Vite config has no `server.proxy` block. During development, requests from `localhost:5173` to your backend at a different port (e.g., `localhost:3000`) will fail with CORS errors unless your backend explicitly allows `localhost:5173` in its CORS headers. This is a configuration gap that will waste debugging time.

**Fix required:**

```D:\Graduation!!!\Blood-Bank-System\vite.config.ts#L19-24
export default defineConfig({
  // ... existing plugins ...
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

---

### H-4: `import.meta.env` Cast as `any` — No Type Safety

**File:** `api/client.ts`, line 7

```D:\Graduation!!!\Blood-Bank-System\src\app\api\client.ts#L7-9
baseURL:
  (import.meta as any).env?.VITE_API_URL || "http://localhost:3000/api",
```

The `(import.meta as any)` cast is a smell that your `tsconfig.json` / `vite-env.d.ts` doesn't have `/// <reference types="vite/client" />`, meaning you lose autocomplete and type safety for all env variables. Additionally, the fallback `"http://localhost:3000/api"` is hardcoded — which is fine for development but dangerous if the `.env` variable is ever missing in staging or production.

---

## 🟠 Medium Priority — Component Refactor Gaps

### M-1: Components Still Import Types AND Data From `mockData.ts`

There are two distinct categories of mockData imports that need to be separated:

**Category A — Types imported from mockData instead of `types/`** (must be fixed before going live):

| Component                   | Imported from mockData                            |
| --------------------------- | ------------------------------------------------- |
| `AdminInventory.tsx`        | `BloodInventoryItem`                              |
| `InventoryBags.tsx`         | `BloodBag`, `BloodType`                           |
| `InventoryDisposal.tsx`     | `BloodBag`, `BloodType`                           |
| `InventoryHistory.tsx`      | `OutflowActionType`, `OutflowRecord`, `BloodType` |
| `InventoryRequests.tsx`     | `BloodBag`, `BloodType`                           |
| `InventoryTransactions.tsx` | `BloodType`, `TransactionType`                    |
| `LabDashboard.tsx`          | `LabTest`, `BloodType`                            |
| `AdminStaff.tsx`            | `User`                                            |

These types **already exist** in your `types/` directory. They just need their import path corrected.

**Category B — Constants still in `mockData.ts` instead of a `constants.ts` file:**
`BLOOD_TYPES`, `CITIES`, `DISEASES`, `HOSPITALS` are used by 10+ components. They're not data — they're static configuration. They should live in `src/app/constants.ts`.

**Category C — Entity data still imported directly** (bypasses React Query entirely):

| Component                   | Direct Data Import                 | Should Use                                        |
| --------------------------- | ---------------------------------- | ------------------------------------------------- |
| `DoctorEligibility.tsx`     | `donors` from mockData             | `useDonors()`                                     |
| `LabResults.tsx`            | `testResults`, `samples`, `donors` | `useTestResults()`, `useSamples()`, `useDonors()` |
| `DonorRegistrationForm.tsx` | `campaigns`, `slot15Data`          | `useCampaigns()`, `useSlot15Data()`               |
| `DoctorCampaigns.tsx`       | `campaigns as initialCampaigns`    | `useCampaigns()`                                  |
| `DoctorAppointments.tsx`    | `campaigns`                        | `useCampaigns()`                                  |
| `AdminInventoryAlerts.tsx`  | `bloodInventory`, `monthlyStats`   | `useBloodInventory()`, `useMonthlyStats()`        |

---

### M-2: `type Donor = any` Anti-Pattern Spreading

```D:\Graduation!!!\Blood-Bank-System\src\app\components\admin\AdminDonors.tsx#L7-7
type Donor = any;
```

Found in `AdminDonors.tsx`, `DoctorDonors.tsx`, and `AdminUsers.tsx`. This completely defeats TypeScript. The actual `Donor` interface exists in `types/donor.ts`. There are also widespread `(d: any)`, `(u: any)`, `(c: any)` casts in filter/map callbacks throughout Admin and Doctor components instead of using the typed interfaces.

---

### M-3: Lab Type Inconsistency — Two Result Schemas

**File:** `types/lab.ts`

`LabTest.result` uses `hcv` / `hbv` field names, while `TestResult` (a separate interface in the same file) uses `hepatitisB` / `hepatitisC`. These represent the same test with different field names:

```D:\Graduation!!!\Blood-Bank-System\src\app\types\lab.ts#L15-24
result?: {
  confirmedBloodType: BloodType;
  hcv: 'negative' | 'positive';   // ← "hcv"
  hbv: 'negative' | 'positive';   // ← "hbv"
  ...
};

// vs. in TestResult:
hepatitisC: 'negative' | 'positive';  // ← "hepatitisC"
hepatitisB: 'negative' | 'positive';  // ← "hepatitisB"
```

When your backend returns a unified lab result format, one of these will break. Agree on the field names with the backend now and unify them into a shared `LabResultData` interface.

---

### M-4: Mock Mutations Don't Update the Mock State

**File:** `api/donors.ts`, `api/campaigns.ts`

```D:\Graduation!!!\Blood-Bank-System\src\app\api\donors.ts#L22-28
export async function createDonor(payload: CreateDonorRequest): Promise<Donor> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 400));
    const newDonor: Donor = { ...payload, id: `DON-${Date.now()}`, donorCode: `...` };
    return newDonor; // ← NOT added to MOCK_DONORS array
  }
```

`createDonor` returns a new donor object but never pushes it into `MOCK_DONORS`. So immediately after calling `createDonor.mutateAsync()`, React Query will invalidate `['donors']` and refetch — getting back the original list without the newly created donor. The success state in `DonorRegistrationForm` is therefore testing a false scenario: the data appears to save but disappears on next fetch. Same issue in `createCampaign`.

---

## 🟡 UI/UX Enhancement Gaps

### U-1: Skeleton Screens Exist But Are Underused

`LoadingSkeleton.tsx` has a `TableSkeleton` and `CardSkeleton` component, but **no component uses them**. Every page shows a generic centered spinner (`PageLoader`) instead of content-shaped skeletons. This creates jarring layout shifts on load.

```D:\Graduation!!!\Blood-Bank-System\src\app\components\shared\LoadingSkeleton.tsx#L43-67
/** Card shimmer placeholder */
export function CardSkeleton({ count = 4 }: { count?: number }) { ... }

/** Table shimmer placeholder */
export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) { ... }
```

These were built and never wired in. Replace `<PageLoader />` with `<CardSkeleton />` + `<TableSkeleton />` in components that show dashboard cards and tables.

---

### U-2: Zero React Error Boundaries

There is no `ErrorBoundary` class component anywhere in the project. The current `ErrorState` component only handles errors you explicitly catch from React Query's `isError`. It does **not** catch unexpected JavaScript errors, broken component renders, or network failures that don't go through React Query (e.g., `MobileApp.tsx`, `AdminAnalytics.tsx`). A single rendering exception in any leaf component will crash the entire app tree.

**Minimum viable setup** — a boundary at the route level:

```D:\Graduation!!!\Blood-Bank-System\src\app\routes.tsx#L1-2
// Wrap each role's layout in an <ErrorBoundary> so a crash
// in /admin doesn't take down /doctor.
```

---

### U-3: Empty States Are Absent From All Tables

None of the tables in the application handle the zero-rows case with a meaningful empty state. When a doctor has no donors yet, or a lab has no pending tests, the table simply renders an empty `<tbody>`. This reads as a loading failure to users.

---

### U-4: No Global Toast/Notification Feedback on Mutations

`sonner` is installed (v2.0.3) but there is no `<Toaster />` component mounted in `App.tsx` or any layout. Mutation outcomes (success or failure) are handled only through local `useState` flags (e.g., `setSuccess(true)` in `DonorRegistrationForm`). There is no consistent feedback for actions like "Bag disposed successfully" or "Staff member created."

---

## 🔵 Type Safety Fixes

### T-1: `password` Field Leaks Into `mockData.ts` User Objects

**File:** `api/staff.ts`

The `staff.ts` API file has a local `users` array (re-exported from mockData) with `password` fields. `AdminStaff.tsx` currently imports `users as initialUsers` from mockData — this means password-bearing objects exist in component scope. The API `fetchStaff` correctly strips passwords with destructuring, but the raw import in the component bypasses that entirely.

---

### T-2: `CreateDonorRequest` Includes Non-Submission Fields

**File:** `types/donor.ts`

```D:\Graduation!!!\Blood-Bank-System\src\app\types\donor.ts#L44-44
export type CreateDonorRequest = Omit<Donor, 'id' | 'donorCode'>;
```

This means `CreateDonorRequest` still includes `registeredBy`, `registeredAt`, `source`, and `donations` — fields that the backend generates, not the frontend. These should also be omitted. The correct DTO should be something like:

```D:\Graduation!!!\Blood-Bank-System\src\app\types\donor.ts#L44-44
export type CreateDonorRequest = Omit<Donor, 'id' | 'donorCode' | 'registeredAt' | 'donations' | 'points'>;
```

---

### T-3: `Campaign` Has No Update/Delete DTOs

**File:** `types/campaign.ts`

```D:\Graduation!!!\Blood-Bank-System\src\app\types\campaign.ts#L14-14
export type CreateCampaignRequest = Omit<Campaign, 'id'>;
```

There's a `CreateCampaignRequest` but no `UpdateCampaignRequest`. The `api/campaigns.ts` has no `updateCampaign` or `deleteCampaign` function. When the UI needs to edit a campaign status (e.g., mark as completed), the type and API surface don't exist.

---

### T-4: `Slot15` Carries Donor PII Inline

**File:** `types/appointment.ts`

The `Slot15` interface directly embeds `donorNationalId`, `donorPhone`, `donorBloodType`, etc. This is fine for the frontend display but should be flagged for the backend contract: the backend should not embed raw national IDs in slot listing responses. Consider a `SlotListItem` (without PII) vs. `SlotDetail` (with PII when the doctor clicks a specific slot).

---

## ✅ What Is Well-Done

Before the action plan, here's what is solid and should not be changed:

- **`api/client.ts`** — Clean single Axios instance, correct JWT injection pattern, good 15s timeout.
- **`types/` barrel exports** — The `index.ts` re-export pattern is correct and scalable.
- **`common.ts` shared unions** — `BloodType`, `DonorStatus`, etc. as pure type-level constants is the right approach.
- **React Query hook structure** — All hooks have correct `queryKey` arrays, `invalidateQueries` on mutation success, and `enabled` guards (e.g., `useDonor(id)`).
- **Route guards** — Role-based `AdminGuard`, `DoctorGuard`, etc. are correctly structured in `routes.tsx`.
- **`AuthContext.tsx`** — Clean: no password exposure, proper localStorage sync, `useCallback` memoization.
- **`LoadingSkeleton.tsx`** — The components themselves are well-built; they just need to be used.
- **`USE_MOCK` toggle per service** — The architecture of having a per-service toggle is the correct pattern for incremental backend integration.

---

## 📋 Prioritized Action Plan

### Phase 1 — Pre-Integration (Do Before Flipping `USE_MOCK`) 🔴

| #   | Task                                                                                                                                                                                                          | File(s)                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| 1   | ✅ **Delete `InventoryContext.tsx`**. Migrate all mutation logic into `useInventory.ts` mutations. Update `InventoryRequests.tsx`, `InventoryBags.tsx`, `InventoryDisposal.tsx` to use hooks only.            | `InventoryContext.tsx`, `useInventory.ts`          |
| 2   | ✅ **Delete `AppointmentContext.tsx`**. Wire `DoctorAppointments.tsx` to `useSlot15Data()` + `useCancelAppointment()`. Rebuild notification state using a `useQuery`-based approach.                          | `AppointmentContext.tsx`, `DoctorAppointments.tsx` |
| 3   | ✅ **Fix `AdminSettings` password change**. Remove `(user as any)?.password`. Create `POST /auth/change-password` endpoint and a corresponding `changePasswordApi()` function + `useChangePassword` mutation. | `AdminSettings.tsx`, new `api/auth.ts`             |
| 4   | ✅ **Add Vite proxy** in `vite.config.ts` to avoid CORS errors in dev.                                                                                                                                        | `vite.config.ts`                                   |
| 5   | ✅ **Add refresh token logic** in `api/client.ts`. Implement a request queue that pauses during token refresh and retries failed requests.                                                                    | `api/client.ts`                                    |
| 6   | ✅ **Create `api/emergency.ts` and `api/analytics.ts`** with proper React Query hooks. Wire `AdminEmergency.tsx` and `AdminAnalytics.tsx` to them.                                                            | new files                                          |
| 7   | ✅ **Fix environment variable typing**: Add `/// <reference types="vite/client" />` to `vite-env.d.ts`. Remove the `(import.meta as any)` cast.                                                               | `api/client.ts`, `vite-env.d.ts`                   |

---

### Phase 2 — Component Cleanup 🟠

| #   | Task                                                                                                                                                                          | File(s)                                     |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 8   | ✅**Extract `BLOOD_TYPES`, `CITIES`, `DISEASES`, `HOSPITALS` to `constants.ts`**. Update all 14+ import sites.                                                                | new `constants.ts`, all affected components |
| 9   | ✅**Re-point type imports**: Change all `import { BloodBag } from '../../data/mockData'` to `import type { BloodBag } from '../../types'` across 8 components.                | Inventory & Lab components                  |
| 10  | ✅ **Replace `type Donor = any`** in `AdminDonors`, `DoctorDonors`, `AdminUsers` with `import type { Donor } from '../../types'`. Eliminate all `(d: any)`, `(u: any)` casts. | 3 components                                |
| 11  | ✅**Decouple `DoctorEligibility`, `LabResults`, `DonorRegistrationForm`, `DoctorCampaigns`** from direct mockData array imports. Use the corresponding React Query hooks.     | 4 components                                |
| 12  | ✅ **Fix mock mutations** in `api/donors.ts` and `api/campaigns.ts` to mutate the in-memory array so refetch returns the new data.                                            | `api/donors.ts`, `api/campaigns.ts`         |
| 13  | ✅**Unify `LabTest.result` and `TestResult`** field names (`hcv`/`hbv` vs. `hepatitisC`/`hepatitisB`). Create a shared `LabResultData` interface.                             | `types/lab.ts`                              |
| 14  | ✅**Fix `CreateDonorRequest`** — add `registeredAt`, `donations`, `points` to the `Omit<>` list.                                                                              | `types/donor.ts`                            |

---

### Phase 3 — UX Polish 🟡

| #   | Task                                                                                                                                                                                                                                    | File(s)                                                        |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 15  | ✅**Add `<Toaster />`** from Sonner to `App.tsx`. Replace all `setSuccess(true)` patterns with `toast.success('...')` / `toast.error('...')` in mutation callbacks.                                                                     | `App.tsx`, all forms                                           |
| 16  | ✅**Migrate all forms to `react-hook-form`**. `DonorRegistrationForm` is the highest priority (921 lines with manual validation). Use the existing `src/app/components/ui/form.tsx` wrapper. Consider adding Zod for schema validation. | `DonorRegistrationForm.tsx`, `AdminStaff.tsx`, `LoginPage.tsx` |
| 17  | **Use `TableSkeleton` / `CardSkeleton`** instead of `PageLoader` in components that render tabular or card-grid data.                                                                                                                   | All admin/doctor/lab/inventory pages                           |
| 18  | **Add empty state JSX** in every table's `{data.length === 0 && <EmptyState />}` branch.                                                                                                                                                | All table components                                           |
| 19  | **Add a root-level `ErrorBoundary`** in `routes.tsx` wrapping each role's layout.                                                                                                                                                       | `routes.tsx`, new `ErrorBoundary.tsx`                          |
| 20  | **Add `.env.example`** with all `VITE_*` variable names documented but without real values.                                                                                                                                             | root directory                                                 |
