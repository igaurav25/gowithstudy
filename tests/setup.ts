/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { vi } from "vitest";

// Mock Prisma client in test environment so queries fail immediately to in-memory fallback without waiting for 5s TCP timeouts
vi.mock("@/lib/prisma", () => {
  const handler = {
    get() {
      return new Proxy({}, {
        get() {
          return () => Promise.reject(new Error("Prisma offline in test environment; falling back to in-memory store."));
        },
      });
    },
  };
  return {
    prisma: new Proxy({}, handler),
  };
});

// Mock Next.js Google Fonts in Vitest
vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist-sans" }),
  Geist_Mono: () => ({ variable: "--font-geist-mono" }),
}));
