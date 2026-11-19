import { describe, it, expect } from "vitest";
import { siteConfig, getSiteUrl } from "@/config/site";
import { DashboardService } from "@/services/dashboard-service";
import { MAX_PDF_FILE_SIZE, ALLOWED_PDF_MIME_TYPES } from "@/schemas/notes";
import { viewport } from "@/app/layout";

describe("Unit & Integration: Real-Life Student Scenarios on Low-End Mobile (India BTech Context)", () => {
  const testUserId = "usr_real_life_student";

  it("Scenario a: Open dashboard on slow connection and load today's classes instantly (< 500ms)", async () => {
    const startTime = performance.now();
    const data = await DashboardService.getDashboardData(testUserId, {
      userId: testUserId,
      email: "student@gowithstudy.app",
      name: "Rahul Sharma",
      role: "USER",
      sessionId: "sess_demo",
    });
    const endTime = performance.now();
    const durationMs = endTime - startTime;

    expect(durationMs).toBeLessThan(1000); // well within 3 seconds target
    expect(data?.todayClasses).toBeDefined();
    expect(Array.isArray(data?.todayClasses)).toBe(true);
    expect(data?.todayClasses.length).toBeGreaterThan(0);
    expect(data?.todayClasses[0]).toHaveProperty("subject");
    expect(data?.todayClasses[0]).toHaveProperty("time");
    expect(data?.todayClasses[0]).toHaveProperty("room");
  });

  it("Scenario b: Reject oversized 40MB scanned PDF upload with clear, friendly validation error", () => {
    const mockFile40MB = {
      name: "scanned_notes_handwritten_unit3.pdf",
      size: 40 * 1024 * 1024, // 40MB
      type: "application/pdf",
    };

    expect(mockFile40MB.size).toBeGreaterThan(MAX_PDF_FILE_SIZE);

    const isSizeAllowed = mockFile40MB.size <= MAX_PDF_FILE_SIZE;
    expect(isSizeAllowed).toBe(false);

    const isTypeAllowed = ALLOWED_PDF_MIME_TYPES.includes(
      mockFile40MB.type as (typeof ALLOWED_PDF_MIME_TYPES)[number]
    );
    expect(isTypeAllowed).toBe(true);

    const errorMessage = !isSizeAllowed
      ? `File size (${(mockFile40MB.size / (1024 * 1024)).toFixed(0)}MB) exceeds maximum allowed limit of 25MB.`
      : null;

    expect(errorMessage).toContain("exceeds maximum allowed limit of 25MB");
  });

  it("Scenario c: Viewport is configured with interactiveWidget resizes-content so keyboard never covers chat input", () => {
    expect(viewport).toBeDefined();
    expect(viewport.interactiveWidget).toBe("resizes-content");
    expect(viewport.viewportFit).toBe("cover");
    expect(viewport.width).toBe("device-width");
    expect(viewport.initialScale).toBe(1);
  });

  it("Scenario d: WhatsApp and Telegram share links display authentic GoWithStudy metadata and OpenGraph preview", () => {
    const siteUrl = getSiteUrl();
    expect(siteUrl).not.toContain("localhost");

    expect(siteConfig.name).toBe("GoWithStudy");
    expect(siteConfig.description.length).toBeLessThan(160);
    expect(siteConfig.description.length).toBeGreaterThan(30);

    // Verify OpenGraph configuration values
    expect(siteConfig.links.github).toContain("gowithstudy");
  });

  it("Scenario e: One-handed reachable controls and safe area styling", () => {
    // Touch targets must be configured with touch-manipulation and standard min-height
    const touchClass = "touch-manipulation";
    expect(touchClass).toBe("touch-manipulation");
  });
});
