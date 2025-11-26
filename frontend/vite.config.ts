import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/", // change later if you deploy under a sub-path
  test: {
    environment: "happy-dom",
    setupFiles: "./src/test/setupTests.ts",
    globals: true,
  },
});
