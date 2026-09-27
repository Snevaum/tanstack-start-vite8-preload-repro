import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tanstackStart({
      // SPA mode prerenders a static shell, so the rendered <link rel="modulepreload"> tags
      // can be inspected on disk without starting a server.
      spa: { enabled: true },
    }),
    viteReact(),
  ],
});
