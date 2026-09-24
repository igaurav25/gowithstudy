"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { hasRequiredRole } from "@/lib/rbac";
import {
  CollegeInfoService,
  CollegeItem,
  CollegeNoticeItem,
  CollegeStats,
} from "@/services/college-info-service";
import {
  createCollegeInfoSchema,
  updateCollegeInfoSchema,
  collegeInfoFilterSchema,
  CreateCollegeInfoInput,
  UpdateCollegeInfoInput,
  CollegeInfoFilterInput,
} from "@/schemas/college-info";

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Fetch all registered colleges
 */
export async function getCollegesAction(): Promise<ActionResponse<CollegeItem[]>> {
  try {
    const colleges = await CollegeInfoService.getColleges();
    return { success: true, data: colleges };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to load colleges" };
  }
}

/**
 * Query notices for a college with filters
 */
export async function getCollegeInfoAction(
  filter: CollegeInfoFilterInput
): Promise<ActionResponse<CollegeNoticeItem[]>> {
  try {
    const parsed = collegeInfoFilterSchema.safeParse(filter);
    const validFilter = parsed.success ? parsed.data : { collegeCode: "DTU" };
    const notices = await CollegeInfoService.getCollegeInfo(validFilter);
    return { success: true, data: notices };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to load university notices" };
  }
}

/**
 * Get college statistics
 */
export async function getCollegeStatsAction(
  collegeCode: string
): Promise<ActionResponse<CollegeStats>> {
  try {
    const stats = await CollegeInfoService.getCollegeStats(collegeCode);
    return { success: true, data: stats };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to load college statistics" };
  }
}

/**
 * Publish official verified notice (Requires MODERATOR or ADMIN)
 */
export async function createCollegeInfoAction(
  input: CreateCollegeInfoInput
): Promise<ActionResponse<CollegeNoticeItem>> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Authentication required to publish notices." };
    }

    if (!hasRequiredRole(session.role, "MODERATOR")) {
      return {
        success: false,
        error: "Permission denied. Only designated University Authorities, Moderators, or Admins can publish verified circulars.",
      };
    }

    const parsed = createCollegeInfoSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Validation failed for notice information",
      };
    }

    const authorName = session.role === "ADMIN" ? "Dean / Official Administration" : "Moderation Section";
    const created = await CollegeInfoService.createCollegeInfo(
      parsed.data,
      session.userId,
      authorName,
      session.role
    );

    revalidatePath("/dashboard/college-info");
    return { success: true, data: created };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "An unexpected error occurred while publishing the circular.",
    };
  }
}

/**
 * Update an existing circular (Requires MODERATOR or ADMIN)
 */
export async function updateCollegeInfoAction(
  input: UpdateCollegeInfoInput
): Promise<ActionResponse<CollegeNoticeItem>> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Authentication required." };
    }

    if (!hasRequiredRole(session.role, "MODERATOR")) {
      return {
        success: false,
        error: "Permission denied. Only Moderators or Admins can modify verified university notices.",
      };
    }

    const parsed = updateCollegeInfoSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Validation failed for updated notice.",
      };
    }

    const updated = await CollegeInfoService.updateCollegeInfo(parsed.data);
    if (!updated) {
      return { success: false, error: "Notice not found." };
    }

    revalidatePath("/dashboard/college-info");
    return { success: true, data: updated };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to update circular.",
    };
  }
}

/**
 * Delete a notice (Requires ADMIN or author)
 */
export async function deleteCollegeInfoAction(
  id: string
): Promise<ActionResponse<{ id: string }>> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Authentication required." };
    }

    if (!hasRequiredRole(session.role, "MODERATOR")) {
      return {
        success: false,
        error: "Permission denied. Only campus administrators or moderators can remove official circulars.",
      };
    }

    const deleted = await CollegeInfoService.deleteCollegeInfo(id);
    if (!deleted) {
      return { success: false, error: "Notice item not found or already deleted." };
    }

    revalidatePath("/dashboard/college-info");
    return { success: true, data: { id } };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to delete notice.",
    };
  }
}
