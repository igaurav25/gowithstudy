import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { hasPermission, getRoleForApplicationType, Permission } from "@/lib/permissions";
import { requireUser, requireAdminPermission, UnauthorizedError, ForbiddenError } from "@/lib/guards";
import * as authModule from "@/lib/auth";
import { AuthService, StoredUser } from "@/services/auth-service";
import { startSignupFlowAction } from "@/features/auth/high-assurance-actions";

describe("Unit: Central Permissions Matrix & Guards", () => {
  describe("Permission Matrix (hasPermission)", () => {
    it("should grant student capabilities to STUDENT role and deny administrative actions", () => {
      expect(hasPermission("STUDENT", "DASHBOARD_ACCESS")).toBe(true);
      expect(hasPermission("STUDENT", "NOTES_VIEW")).toBe(true);
      expect(hasPermission("STUDENT", "AI_TUTOR_CHAT")).toBe(true);
      expect(hasPermission("STUDENT", "COMMUNITY_POST")).toBe(true);

      // Deny administrative and teacher features
      expect(hasPermission("STUDENT", "TEACHER_DASHBOARD")).toBe(false);
      expect(hasPermission("STUDENT", "MODERATION_QUEUE_VIEW")).toBe(false);
      expect(hasPermission("STUDENT", "ADMIN_PORTAL_ACCESS")).toBe(false);
      expect(hasPermission("STUDENT", "APPLICATIONS_REVIEW")).toBe(false);
      expect(hasPermission("STUDENT", "ADMIN_PROVISION")).toBe(false);
    });

    it("should grant legacy USER role identical capabilities to STUDENT", () => {
      expect(hasPermission("USER", "DASHBOARD_ACCESS")).toBe(true);
      expect(hasPermission("USER", "NOTES_VIEW")).toBe(true);
      expect(hasPermission("USER", "ADMIN_PORTAL_ACCESS")).toBe(false);
    });

    it("should grant teacher capabilities to TEACHER role", () => {
      expect(hasPermission("TEACHER", "DASHBOARD_ACCESS")).toBe(true);
      expect(hasPermission("TEACHER", "TEACHER_DASHBOARD")).toBe(true);
      expect(hasPermission("TEACHER", "ASSIGNMENTS_CREATE_CLASS")).toBe(true);
      expect(hasPermission("TEACHER", "COLLEGE_NOTICES_PUBLISH")).toBe(true);

      expect(hasPermission("TEACHER", "ADMIN_PORTAL_ACCESS")).toBe(false);
      expect(hasPermission("TEACHER", "APPLICATIONS_REVIEW")).toBe(false);
    });

    it("should grant moderation capabilities to MODERATOR role", () => {
      expect(hasPermission("MODERATOR", "DASHBOARD_ACCESS")).toBe(true);
      expect(hasPermission("MODERATOR", "MODERATION_QUEUE_VIEW")).toBe(true);
      expect(hasPermission("MODERATOR", "MODERATION_ACTION")).toBe(true);
      expect(hasPermission("MODERATOR", "CONTENT_REPORT_RESOLVE")).toBe(true);

      expect(hasPermission("MODERATOR", "ADMIN_PORTAL_ACCESS")).toBe(false);
      expect(hasPermission("MODERATOR", "APPLICATIONS_REVIEW")).toBe(false);
    });

    it("should grant application review and user management to ADMIN role", () => {
      expect(hasPermission("ADMIN", "ADMIN_PORTAL_ACCESS")).toBe(true);
      expect(hasPermission("ADMIN", "APPLICATIONS_VIEW")).toBe(true);
      expect(hasPermission("ADMIN", "APPLICATIONS_REVIEW")).toBe(true);
      expect(hasPermission("ADMIN", "USERS_VIEW")).toBe(true);
      expect(hasPermission("ADMIN", "USERS_SUSPEND")).toBe(true);
      expect(hasPermission("ADMIN", "ANNOUNCEMENTS_CREATE")).toBe(true);
      expect(hasPermission("ADMIN", "AUDIT_LOG_VIEW")).toBe(true);

      // Super Admin only privileges denied to normal ADMIN
      expect(hasPermission("ADMIN", "ADMIN_PROVISION")).toBe(false);
      expect(hasPermission("ADMIN", "DESTRUCTIVE_ACTIONS")).toBe(false);
    });

    it("should grant all privileges including bootstrap and destructive actions to SUPER_ADMIN", () => {
      expect(hasPermission("SUPER_ADMIN", "ADMIN_PORTAL_ACCESS")).toBe(true);
      expect(hasPermission("SUPER_ADMIN", "APPLICATIONS_REVIEW")).toBe(true);
      expect(hasPermission("SUPER_ADMIN", "ADMIN_PROVISION")).toBe(true);
      expect(hasPermission("SUPER_ADMIN", "SYSTEM_SETTINGS_MANAGE")).toBe(true);
      expect(hasPermission("SUPER_ADMIN", "DESTRUCTIVE_ACTIONS")).toBe(true);
    });

    it("should correctly resolve role from application type", () => {
      expect(getRoleForApplicationType("STUDENT")).toBe("STUDENT");
      expect(getRoleForApplicationType("TEACHER")).toBe("TEACHER");
    });
  });

  describe("Central Guard: requireUser", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it("should throw UnauthorizedError when no active session cookie is present", async () => {
      vi.spyOn(authModule, "getSession").mockResolvedValue(null);

      await expect(requireUser()).rejects.toThrow(UnauthorizedError);
      await expect(requireUser()).rejects.toThrow(/You must be signed in/);
    });

    it("should throw ForbiddenError when user account status is SUSPENDED or isSuspended is true", async () => {
      vi.spyOn(authModule, "getSession").mockResolvedValue({
        userId: "usr_suspended_01",
        email: "student@test.ac.in",
        name: "Suspended Student",
        role: "STUDENT",
        sessionId: "ses_123",
      });

      vi.spyOn(AuthService, "getUserById").mockResolvedValue({
        id: "usr_suspended_01",
        name: "Suspended Student",
        email: "student@test.ac.in",
        passwordHash: "hash",
        role: "STUDENT",
        college: "DTU",
        course: "B.Tech",
        branch: "CSE",
        year: 2,
        semester: 4,
        emailVerified: true,
        isSuspended: true,
        accountStatus: "SUSPENDED",
        createdAt: new Date(),
      } as StoredUser);

      await expect(requireUser()).rejects.toThrow(ForbiddenError);
      await expect(requireUser()).rejects.toThrow(/suspended/i);
    });

    it("should throw ForbiddenError when user account status is PENDING_ACTIVATION", async () => {
      vi.spyOn(authModule, "getSession").mockResolvedValue({
        userId: "usr_pending_01",
        email: "pending@test.ac.in",
        name: "Pending Student",
        role: "STUDENT",
        sessionId: "ses_124",
      });

      vi.spyOn(AuthService, "getUserById").mockResolvedValue({
        id: "usr_pending_01",
        name: "Pending Student",
        email: "pending@test.ac.in",
        passwordHash: "hash",
        role: "STUDENT",
        college: "DTU",
        course: "B.Tech",
        branch: "CSE",
        year: 1,
        semester: 1,
        emailVerified: true,
        isSuspended: false,
        accountStatus: "PENDING_ACTIVATION",
        createdAt: new Date(),
      } as StoredUser);

      await expect(requireUser()).rejects.toThrow(ForbiddenError);
      await expect(requireUser()).rejects.toThrow(/pending activation/i);
    });

    it("should enforce required role and reject unauthorized role", async () => {
      vi.spyOn(authModule, "getSession").mockResolvedValue({
        userId: "usr_student_01",
        email: "student@test.ac.in",
        name: "Active Student",
        role: "STUDENT",
        sessionId: "ses_125",
      });

      vi.spyOn(AuthService, "getUserById").mockResolvedValue({
        id: "usr_student_01",
        name: "Active Student",
        email: "student@test.ac.in",
        passwordHash: "hash",
        role: "STUDENT",
        college: "DTU",
        course: "B.Tech",
        branch: "CSE",
        year: 2,
        semester: 4,
        emailVerified: true,
        isSuspended: false,
        accountStatus: "ACTIVE",
        createdAt: new Date(),
      } as StoredUser);

      // Student attempting to access TEACHER-only route
      await expect(requireUser({ roles: ["TEACHER"] })).rejects.toThrow(ForbiddenError);
      await expect(requireUser({ roles: ["TEACHER"] })).rejects.toThrow(/Insufficient privileges/);

      // Student allowed on STUDENT role
      const result = await requireUser({ roles: ["STUDENT", "USER"] });
      expect(result.user.id).toBe("usr_student_01");
      expect(result.user.role).toBe("STUDENT");
    });
  });

  describe("Central Guard: requireAdminPermission", () => {
    it("should reject non-admin users attempting administrative actions", async () => {
      vi.spyOn(authModule, "getAdminSession").mockResolvedValue(null);
      vi.spyOn(authModule, "getSession").mockResolvedValue({
        userId: "usr_student_01",
        email: "student@test.ac.in",
        name: "Active Student",
        role: "STUDENT",
        sessionId: "ses_126",
      });

      vi.spyOn(AuthService, "getUserById").mockResolvedValue({
        id: "usr_student_01",
        name: "Active Student",
        email: "student@test.ac.in",
        passwordHash: "hash",
        role: "STUDENT",
        college: "DTU",
        course: "B.Tech",
        branch: "CSE",
        year: 2,
        semester: 4,
        emailVerified: true,
        isSuspended: false,
        accountStatus: "ACTIVE",
        createdAt: new Date(),
      } as StoredUser);

      await expect(requireAdminPermission("APPLICATIONS_REVIEW")).rejects.toThrow(ForbiddenError);
      await expect(requireAdminPermission("APPLICATIONS_REVIEW")).rejects.toThrow(/Administrative role required/);
    });

    it("should allow ADMIN to review applications but forbid ADMIN_PROVISION", async () => {
      vi.spyOn(authModule, "getAdminSession").mockResolvedValue({
        userId: "usr_admin_01",
        email: "admin@test.gov",
        name: "Site Admin",
        role: "ADMIN",
        sessionId: "ses_admin_1",
      });

      vi.spyOn(AuthService, "getUserById").mockResolvedValue({
        id: "usr_admin_01",
        name: "Site Admin",
        email: "admin@test.gov",
        passwordHash: "hash",
        role: "ADMIN",
        college: "Central Admin",
        course: "Admin",
        branch: "Governance",
        year: 4,
        semester: 8,
        emailVerified: true,
        isSuspended: false,
        accountStatus: "ACTIVE",
        createdAt: new Date(),
      } as StoredUser);

      // Allowed
      const approved = await requireAdminPermission("APPLICATIONS_REVIEW");
      expect(approved.adminUser.id).toBe("usr_admin_01");

      // Forbid ADMIN from provisioning other admins (SUPER_ADMIN only)
      await expect(requireAdminPermission("ADMIN_PROVISION")).rejects.toThrow(ForbiddenError);
    });
  });

  describe("Feature Flag: Public Signup Disabler", () => {
    const originalEnv = process.env.VERIFICATION_WORKFLOW_ENABLED;

    afterEach(() => {
      process.env.VERIFICATION_WORKFLOW_ENABLED = originalEnv;
    });

    it("should block startSignupFlowAction when VERIFICATION_WORKFLOW_ENABLED=true", async () => {
      process.env.VERIFICATION_WORKFLOW_ENABLED = "true";

      const res = await startSignupFlowAction({ email: "applicant@dtu.ac.in" });
      expect(res.success).toBe(false);
      expect(res.message).toMatch(/disabled.*\/apply/i);
    });
  });
});

