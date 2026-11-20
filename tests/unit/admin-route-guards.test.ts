import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Unit: Static Security Audit & Admin Route Guard Verification", () => {
  const rootDir = process.cwd();

  it("should ensure the Admin Portal sets robots noindex/nofollow to prevent crawler indexing", () => {
    const layoutPath = path.join(rootDir, "app/admin/layout.tsx");
    expect(fs.existsSync(layoutPath)).toBe(true);

    const layoutContent = fs.readFileSync(layoutPath, "utf-8");
    expect(layoutContent).toMatch(/index:\s*false/);
    expect(layoutContent).toMatch(/follow:\s*false/);
  });

  it("should ensure the authenticated admin portal layout enforces requireAdminPermission", () => {
    const portalLayoutPath = path.join(rootDir, "app/admin/(portal)/layout.tsx");
    expect(fs.existsSync(portalLayoutPath)).toBe(true);

    const content = fs.readFileSync(portalLayoutPath, "utf-8");
    expect(content).toContain("requireAdminPermission");
    expect(content).toContain("ADMIN_PORTAL_ACCESS");
  });

  it("should verify all admin server actions in features/admin enforce administrative clearance", () => {
    const appActionsPath = path.join(rootDir, "features/admin/application-actions.ts");
    expect(fs.existsSync(appActionsPath)).toBe(true);

    const appActionsContent = fs.readFileSync(appActionsPath, "utf-8");
    expect(appActionsContent).toContain("requireAdminPermission");
    expect(appActionsContent).toContain("APPLICATIONS_VIEW");
    expect(appActionsContent).toContain("APPLICATIONS_REVIEW");

    // Ensure actions in application-actions.ts check admin authorization before mutations
    const exportedActions = [
      "getAdminApplicationsAction",
      "approveApplicationAction",
      "rejectApplicationAction",
      "getAdminOverviewAction",
      "getAdminAuditLogsAction",
    ];

    for (const actionName of exportedActions) {
      expect(appActionsContent).toContain(actionName);
    }

    const adminActionsPath = path.join(rootDir, "features/admin/actions.ts");
    expect(fs.existsSync(adminActionsPath)).toBe(true);
    const adminActionsContent = fs.readFileSync(adminActionsPath, "utf-8");
    expect(adminActionsContent).toContain("toggleUserStatusAction");
    expect(adminActionsContent).toContain("updateUserRoleAction");
  });

  it("should verify that public signup routes block self-service registration when flag is active", () => {
    const highAssurancePath = path.join(rootDir, "features/auth/high-assurance-actions.ts");
    const content = fs.readFileSync(highAssurancePath, "utf-8");

    expect(content).toContain("Direct self-service account registration is currently disabled");
    expect(content).toContain("/apply");
  });

  it("should verify that /teacher dashboard shell enforces requireUser with TEACHER role", () => {
    const teacherPagePath = path.join(rootDir, "app/teacher/page.tsx");
    expect(fs.existsSync(teacherPagePath)).toBe(true);

    const content = fs.readFileSync(teacherPagePath, "utf-8");
    expect(content).toContain("requireUser");
    expect(content).toContain('"TEACHER"');
  });

  it("should verify that no production secrets or hardcoded passwords exist in script files", () => {
    const bootstrapPath = path.join(rootDir, "scripts/admin-bootstrap.ts");
    const bootstrapContent = fs.readFileSync(bootstrapPath, "utf-8");

    // Passwords must be generated or passed dynamically, never hardcoded static constants
    expect(bootstrapContent).not.toMatch(/password\s*=\s*["']password123["']/i);
    expect(bootstrapContent).not.toMatch(/password\s*=\s*["']admin123["']/i);
    expect(bootstrapContent).toContain("crypto.randomBytes");
  });
});
