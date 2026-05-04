// ═══════════════════════════════════════════════════════════
// Auth API service — login / logout / token helpers
// ═══════════════════════════════════════════════════════════
import apiClient from "./client";
import type {
  LoginRequest,
  LoginResponse,
  ChangePasswordRequest,
  User,
} from "../types/auth";

// ── Mock mode flag ─────────────────────────────────────────
// When the backend is not yet available, the app falls back to
// the hardcoded mock users so the UI remains fully usable.
// Flip this to `false` once your backend's /auth/login is live.
const USE_MOCK = true;

// ── Mock users (kept ONLY in this file, not imported elsewhere) ─
const MOCK_USERS: (User & { password: string })[] = [
  {
    id: "USR-001",
    name: "د. محمد إبراهيم السيد",
    email: "admin@bloodlink.benisuef.eg",
    password: "admin123",
    role: "admin",
    age: 52,
    nationalId: "27301050001111",
    phone: "01012345678",
    address: "شارع النيل، أمام المحافظة",
    city: "بني سويف",
    status: "active",
    createdAt: "2024-01-01",
  },
  {
    id: "USR-002",
    name: "د. أحمد حسن علي",
    email: "dr.ahmed.hassan@bloodlink.benisuef.eg",
    password: "doctor123",
    role: "doctor",
    age: 38,
    nationalId: "28601020002222",
    phone: "01123456789",
    address: "شارع الجمهورية، الواسطى",
    city: "الواسطى",
    status: "active",
    createdAt: "2024-02-15",
  },
  {
    id: "USR-003",
    name: "د. سارة محمود رضا",
    email: "dr.sara.mahmoud@bloodlink.benisuef.eg",
    password: "doctor123",
    role: "doctor",
    age: 34,
    nationalId: "29101030003333",
    phone: "01234567890",
    address: "شارع الطبراوي، ناصر",
    city: "ناصر",
    status: "active",
    createdAt: "2024-03-10",
  },
  {
    id: "USR-004",
    name: "د. خالد عبد الرحمن",
    email: "dr.khaled.abdulrahman@bloodlink.benisuef.eg",
    password: "doctor123",
    role: "doctor",
    age: 41,
    nationalId: "28401040004444",
    phone: "01098765432",
    address: "شارع السكة الحديد، ببا",
    city: "ببا",
    status: "active",
    createdAt: "2024-04-05",
  },
  {
    id: "USR-005",
    name: "د. هنا طارق مصطفى",
    email: "dr.hana.tarek@bloodlink.benisuef.eg",
    password: "doctor123",
    role: "doctor",
    age: 29,
    nationalId: "29601050005555",
    phone: "01555443322",
    address: "شارع جمال عبد الناصر، الفشن",
    city: "الفشن",
    status: "inactive",
    createdAt: "2024-06-20",
  },
  {
    id: "USR-006",
    name: "د. ياسمين حسام نور",
    email: "lab.yasmin.hossam@bloodlink.benisuef.eg",
    password: "lab123",
    role: "lab",
    age: 31,
    nationalId: "29401060006666",
    phone: "01677889900",
    address: "شارع الوحدة، بني سويف",
    city: "بني سويف",
    status: "active",
    createdAt: "2024-05-12",
  },
  {
    id: "USR-007",
    name: "د. كريم وليد سعد",
    email: "lab.karim.walid@bloodlink.benisuef.eg",
    password: "lab123",
    role: "lab",
    age: 36,
    nationalId: "28901070007777",
    phone: "01011223344",
    address: "شارع الملك، الواسطى",
    city: "الواسطى",
    status: "active",
    createdAt: "2024-07-01",
  },
  {
    id: "USR-008",
    name: "أ. نادية فتحي حسين",
    email: "inv.nadia.fathi@bloodlink.benisuef.eg",
    password: "inventory123",
    role: "inventory",
    age: 40,
    nationalId: "28501080008888",
    phone: "01022334455",
    address: "شارع بورسعيد، بني سويف",
    city: "بني سويف",
    status: "active",
    createdAt: "2024-08-01",
  },
];

/**
 * Authenticate a user.
 * In mock mode: checks against MOCK_USERS above.
 * In real mode: POSTs to /auth/login.
 */
export async function loginApi(
  credentials: LoginRequest,
): Promise<LoginResponse> {
  if (USE_MOCK) {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 500));

    const found = MOCK_USERS.find(
      (u) =>
        u.email === credentials.email && u.password === credentials.password,
    );

    if (!found) {
      throw {
        response: {
          status: 422,
          data: { message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        },
      };
    }
    if (found.status === "inactive") {
      throw {
        response: {
          status: 403,
          data: { message: "هذا الحساب معطل. يرجى التواصل مع المدير" },
        },
      };
    }

    // Strip password before returning
    const { password: _, ...user } = found;
    return { token: `mock-jwt-${user.id}`, user };
  }

  // ── Real API call ──
  const { data } = await apiClient.post<LoginResponse>(
    "/auth/login",
    credentials,
  );
  return data;
}

/**
 * Change the authenticated user's password.
 *
 * Mock mode: looks up the user in MOCK_USERS by ID and compares the
 * currentPassword against the stored plaintext (dev-only shortcut).
 * The User object returned by the API never carries a password field.
 *
 * Real mode: delegates validation entirely to the backend — the
 * frontend never sees or stores the password hash.
 */
export async function changePasswordApi(
  userId: string,
  payload: ChangePasswordRequest,
): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));

    const found = MOCK_USERS.find((u) => u.id === userId);
    if (!found) {
      throw {
        response: { status: 404, data: { message: "المستخدم غير موجود" } },
      };
    }
    if (found.password !== payload.currentPassword) {
      throw {
        response: {
          status: 422,
          data: { message: "كلمة المرور الحالية غير صحيحة" },
        },
      };
    }
    if (payload.newPassword.length < 6) {
      throw {
        response: {
          status: 422,
          data: { message: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" },
        },
      };
    }
    // Update in-memory mock so the change persists within the dev session
    found.password = payload.newPassword;
    return;
  }

  // ── Real API call — backend validates against stored hash ──
  await apiClient.post("/auth/change-password", payload);
}
