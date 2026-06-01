import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative asset paths so the built site works no matter what subpath it
  // is served from (e.g. https://<user>.github.io/<repo>/ on GitHub Pages).
  // This SPA has no client-side router, so relative paths are all we need.
  base: "./",
});
