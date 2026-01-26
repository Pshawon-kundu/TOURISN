import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    port: 5173, // Changed from 8081 to avoid conflict with Expo
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
