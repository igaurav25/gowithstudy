import { describe, it, expect } from "vitest";
import {
  ROLE_HIERARCHY,
  hasRequiredRole,
  assertRole,
} from "@/lib/rbac";

describe("Unit: Role-Based Access Control (RBAC)", () => {
  it("should have correct hierarchy levels", () => {
    expect(ROLE_HIERARCHY.USER).toBe(1);
    expect(ROLE_HIERARCHY.MODERATOR).toBe(2);
    expect(ROLE_HIERARCHY.ADMIN).toBe(3);

    expect(ROLE_HIERARCHY.ADMIN).toBeGreaterThan(ROLE_HIERARCHY.MODERATOR);
    expect(ROLE_HIERARCHY.MODERATOR).toBeGreaterThan(ROLE_HIERARCHY.USER);
  });

  describe("hasRequiredRole() checks", () => {
    it("should allow USER access to USER role only", () => {
      expect(hasRequiredRole("USER", "USER")).toBe(true);
      expect(hasRequiredRole("USER", "MODERATOR")).toBe(false);
      expect(hasRequiredRole("USER", "ADMIN")).toBe(false);
    });

    it("should allow MODERATOR access to USER and MODERATOR roles", () => {
      expect(hasRequiredRole("MODERATOR", "USER")).toBe(true);
      expect(hasRequiredRole("MODERATOR", "MODERATOR")).toBe(true);
      expect(hasRequiredRole("MODERATOR", "ADMIN")).toBe(false);
    });

    it("should allow ADMIN access to all roles", () => {
      expect(hasRequiredRole("ADMIN", "USER")).toBe(true);
      expect(hasRequiredRole("ADMIN", "MODERATOR")).toBe(true);
      expect(hasRequiredRole("ADMIN", "ADMIN")).toBe(true);
    });
  });

  describe("assertRole() assertion", () => {
    it("should pass cleanly when role matches or exceeds required level", () => {
      expect(() => assertRole("ADMIN", "MODERATOR")).not.toThrow();
      expect(() => assertRole("ADMIN", "USER")).not.toThrow();
      expect(() => assertRole("MODERATOR", "USER")).not.toThrow();
      expect(() => assertRole("USER", "USER")).not.toThrow();
    });

    it("should throw Forbidden error when role is insufficient", () => {
      expect(() => assertRole("USER", "MODERATOR")).toThrow(
        /Forbidden: Insufficient privileges/
      );
      expect(() => assertRole("USER", "ADMIN")).toThrow(
        /Forbidden: Insufficient privileges/
      );
      expect(() => assertRole("MODERATOR", "ADMIN")).toThrow(
        /Forbidden: Insufficient privileges/
      );
    });
  });
});
