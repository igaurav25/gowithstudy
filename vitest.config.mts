import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    env: {
      DATABASE_URL: "postgresql://test_user:test_password@localhost:5432/campusflow_test",
      AUTH_SECRET: "campusflow-super-secure-dev-session-key-32chars",
      SESSION_COOKIE_NAME: "campusflow_session",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
