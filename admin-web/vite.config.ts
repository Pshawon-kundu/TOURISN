import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  base: "/admin/", // Set base path for admin panel
  server: {
    port: 4173,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
