import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Prueba de humo en Chromium real: `npm run humo` construye la app y corre humo/*.humo.ts en orden.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["humo/**/*.humo.ts"],
    fileParallelism: false,
    testTimeout: 90_000,
    hookTimeout: 120_000,
  },
});
