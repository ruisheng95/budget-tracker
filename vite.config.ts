import { defineConfig, loadEnv } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import checker from "vite-plugin-checker";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss(),
      checker({
        typescript: true,
        eslint: {
          useFlatConfig: true,
          lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
        },
      }),
      VitePWA({
        registerType: "autoUpdate",
        devOptions: {
          enabled: true,
        },
        includeAssets: ["screenshot1.png"],
        manifest: {
          name: "Budget Tracker",
          short_name: "Budget",
          description: "A web app to track your budget expenses",
          theme_color: "#ffffff",
          icons: [
            {
              src: "icon-192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "icon-512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
          screenshots: [
            {
              src: "screenshot1.png",
              sizes: "580x347",
              type: "image/png",
              form_factor: "wide",
              label: "Budget Homepage",
            },
            {
              src: "screenshot2.png",
              sizes: "348x756",
              type: "image/png",
              label: "Budget Homepage",
            },
          ],
        },
      }),
    ],
    server: {
      allowedHosts: [""],
    },
    base: env.BASE_URL || "/",
  };
});
