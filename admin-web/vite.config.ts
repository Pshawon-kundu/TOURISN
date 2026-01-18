import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  base: "/", // Root path since admin panel is the only app on Netlify
  server: {
    port: 4173,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
