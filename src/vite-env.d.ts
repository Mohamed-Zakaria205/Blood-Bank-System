/// <reference types="vite/client" />

// ═══════════════════════════════════════════════════════════
// Typed environment variables
//
// Every VITE_* variable used anywhere in the codebase must be
// declared here so TypeScript knows its shape at compile time.
// Add a new entry whenever you introduce a new VITE_ variable.
//
// See .env.example for the canonical list of variable names
// and their permitted values.
// ═══════════════════════════════════════════════════════════

interface ImportMetaEnv {
  /**
   * Base URL for all Axios API calls.
   *
   * • Development  →  `/api`   (Vite proxy forwards to VITE_BACKEND_TARGET)
   * • Production   →  `https://api.bloodlink.eg/api`  (real backend)
   *
   * Never set this to a localhost URL in production builds.
   */
  readonly VITE_API_URL: string;
}

// Required boilerplate — do not remove.
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
