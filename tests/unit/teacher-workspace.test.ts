import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { requireUser, UnauthorizedError, ForbiddenError } from "@/lib/guards";
import * as authModule from "@/lib/auth";
import { AuthService, StoredUser } from "@/services/auth-service";

describe("Unit: Teacher Workspace Access Guard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should permit verified TEACHER with ACTIVE status to access workspace", async () => {
    vi.spyOn(authModule, "getSession").mockResolvedValue({
      userId: "usr_teacher_01",
      email: "vikram.sharma@dtu.ac.in",
      name: "Dr. Vikram Sharma",
      role: "TEACHER",
      sessionId: "ses_teacher_01",
    });

    vi.spyOn(AuthService, "getUserById").mockResolvedValue({
      id: "usr_teacher_01",
      name: "Dr. Vikram Sharma",
      email: "vikram.sharma@dtu.ac.in",
      role: "TEACHER",
      accountStatus: "ACTIVE",
      isSuspended: false,
      emailVerified: true,
      createdAt: new Date(),
    } as StoredUser);

    const result = await requireUser({ roles: ["TEACHER"] });
    expect(result.user.id).toBe("usr_teacher_01");
    expect(result.user.role).toBe("TEACHER");
    expect(result.user.accountStatus).toBe("ACTIVE");
  });

  it("should forbid regular STUDENT or USER from accessing TEACHER workspace", async () => {
    vi.spyOn(authModule, "getSession").mockResolvedValue({
      userId: "usr_student_01",
      email: "aman.gupta@dtu.ac.in",
      name: "Aman Gupta",
      role: "STUDENT",
      sessionId: "ses_student_01",
    });

    vi.spyOn(AuthService, "getUserById").mockResolvedValue({
      id: "usr_student_01",
      name: "Aman Gupta",
      email: "aman.gupta@dtu.ac.in",
      role: "STUDENT",
      accountStatus: "ACTIVE",
      isSuspended: false,
      emailVerified: true,
      createdAt: new Date(),
    } as StoredUser);

    await expect(requireUser({ roles: ["TEACHER"] })).rejects.toThrow(ForbiddenError);
  });

  it("should forbid suspended teacher from accessing workspace", async () => {
    vi.spyOn(authModule, "getSession").mockResolvedValue({
      userId: "usr_teacher_suspended",
      email: "suspended.prof@dtu.ac.in",
      name: "Prof. Suspended",
      role: "TEACHER",
      sessionId: "ses_teacher_suspended",
    });

    vi.spyOn(AuthService, "getUserById").mockResolvedValue({
      id: "usr_teacher_suspended",
      name: "Prof. Suspended",
      email: "suspended.prof@dtu.ac.in",
      role: "TEACHER",
      accountStatus: "SUSPENDED",
      isSuspended: true,
      emailVerified: true,
      createdAt: new Date(),
    } as StoredUser);

    await expect(requireUser({ roles: ["TEACHER"] })).rejects.toThrow(ForbiddenError);
  });

  it("should reject unauthenticated requests with UnauthorizedError", async () => {
    vi.spyOn(authModule, "getSession").mockResolvedValue(null);

    await expect(requireUser({ roles: ["TEACHER"] })).rejects.toThrow(UnauthorizedError);
  });
});
