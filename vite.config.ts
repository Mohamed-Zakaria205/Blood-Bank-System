import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

function figmaAssetResolver() {
  return {
    name: "figma-asset-resolver",
    resolveId(id: string) {
      if (id.startsWith("figma:asset/")) {
        const filename = id.replace("figma:asset/", "");
        return path.resolve(__dirname, "src/assets", filename);
      }
    },
  };
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
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // ──────────────────────────────────────────────────────
  // Dev server — proxy keeps the browser origin at localhost:5173 so
  // there are zero CORS pre-flight failures when talking to the backend.
  //
  // How it works:
  //   Browser  →  GET /api/donors  (same origin, no CORS header needed)
  //   Vite     →  forwards to http://localhost:3000/api/donors
  //   Backend  →  responds normally
  //
  // Change VITE_BACKEND_TARGET in .env (never commit real URLs) if your
  // backend runs on a different host or port.
  // ──────────────────────────────────────────────────────
  server: {
    port: 5173,
    proxy: {
      // Every request whose path starts with /api is forwarded.
      // No path rewriting — the backend is expected to serve routes
      // under /api (e.g. GET /api/donors, POST /api/auth/login).
      //
      // ⚠ Change the target below if your backend runs on a different
      //   port or host (e.g. Spring Boot → 8080, Django → 8000).
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true, // rewrites the Host header to match the target
        secure: false, // allow self-signed certs in local dev
      },
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ["**/*.svg", "**/*.csv"],
});
