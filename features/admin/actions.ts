"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { assertRole, hasRequiredRole } from "@/lib/rbac";
import { AdminService } from "@/services/admin-service";
import {
  updateUserRoleSchema,
  toggleUserStatusSchema,
  resolveReportSchema,
  createAnnouncementSchema,
  UpdateUserRoleInput,
  ToggleUserStatusInput,
  ResolveReportInput,
  CreateAnnouncementInput,
} from "@/schemas/admin";

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Update user role (Promote / Demote) — Admin Only
 */
export async function updateUserRoleAction(
  input: UpdateUserRoleInput
): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    assertRole(session.role, "ADMIN");

    const parsed = updateUserRoleSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid role data",
      };
    }

    // Prevent demoting oneself
    if (parsed.data.targetUserId === session.userId && parsed.data.role !== "ADMIN") {
      return {
        success: false,
        error: "Admins cannot demote their own active administrative account.",
      };
    }

    const updated = await AdminService.updateUserRole(
      session.userId,
      parsed.data.targetUserId,
      parsed.data.role,
      parsed.data.reason
    );

    revalidatePath("/dashboard/admin");
    return { success: true, data: updated };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update user role";
    return { success: false, error: message };
  }
}

/**
 * Toggle user account suspension — Admin Only
 */
export async function toggleUserStatusAction(
  input: ToggleUserStatusInput
): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    assertRole(session.role, "ADMIN");

    const parsed = toggleUserStatusSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid input data",
      };
    }

    if (parsed.data.targetUserId === session.userId) {
      return {
        success: false,
        error: "Admins cannot suspend their own active account.",
      };
    }

    const updated = await AdminService.toggleUserSuspension(
      session.userId,
      parsed.data.targetUserId,
      parsed.data.isSuspended,
      parsed.data.reason
    );

    revalidatePath("/dashboard/admin");
    return { success: true, data: updated };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to toggle user suspension";
    return { success: false, error: message };
  }
}

/**
 * Resolve or reject content moderation report — Moderator or Admin
 */
export async function resolveReportAction(
  input: ResolveReportInput
): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    if (!hasRequiredRole(session.role, "MODERATOR")) {
      return {
        success: false,
        error: "Forbidden: Moderator clearance required to resolve reports.",
      };
    }

    const parsed = resolveReportSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid report resolution data",
      };
    }

    const resolved = await AdminService.resolveReport(session.userId, parsed.data);

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/community");
    return { success: true, data: resolved };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to resolve report";
    return { success: false, error: message };
  }
}

/**
 * Publish a new verified campus announcement — Moderator or Admin
 */
export async function createAnnouncementAction(
  input: CreateAnnouncementInput
): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    if (!hasRequiredRole(session.role, "MODERATOR")) {
      return {
        success: false,
        error: "Forbidden: Moderator clearance required to publish announcements.",
      };
    }

    const parsed = createAnnouncementSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid announcement data",
      };
    }

    const created = await AdminService.createAnnouncement(
      session.userId,
      session.name,
      parsed.data
    );

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard");
    return { success: true, data: created };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to publish announcement";
    return { success: false, error: message };
  }
}

/**
 * Delete a campus announcement — Moderator or Admin
 */
export async function deleteAnnouncementAction(
  announcementId: string
): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    if (!hasRequiredRole(session.role, "MODERATOR")) {
      return {
        success: false,
        error: "Forbidden: Moderator clearance required to delete announcements.",
      };
    }

    const deleted = await AdminService.deleteAnnouncement(
      session.userId,
      announcementId
    );

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard");
    return { success: deleted };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to delete announcement";
    return { success: false, error: message };
  }
}
