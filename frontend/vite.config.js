import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The dev server runs on http://localhost:5173 and forwards every /api request
// to the Express backend on http://localhost:5000 (so no CORS problems).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:5000", changeOrigin: true },
    },
  },
});
