import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E & Responsive Configuration for GoWithStudy
 * Covers mid/low-end Android devices (Pixel 7, Moto G), compact iOS (iPhone SE), iPad, and Desktop Chrome.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "Desktop Chrome",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Pixel 7 (Android 412x915)",
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "iPhone SE (Compact 375x667)",
      use: { ...devices["iPhone SE"] },
    },
    {
      name: "iPad Mini",
      use: { ...devices["iPad Mini"] },
    },
    {
      name: "Ultra-Budget Android (360x640)",
      use: {
        viewport: { width: 360, height: 640 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
