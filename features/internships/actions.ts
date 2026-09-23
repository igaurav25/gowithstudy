"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { InternshipsService } from "@/services/internships-service";
import {
  createInternshipSchema,
  updateInternshipSchema,
  updateInternshipStatusSchema,
  CreateInternshipInput,
  UpdateInternshipInput,
  ApplicationStatus,
} from "@/schemas/internships";

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Add a new internship / job application
 */
export async function createInternshipAction(
  input: CreateInternshipInput
): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const parsed = createInternshipSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid application data",
      };
    }

    const created = await InternshipsService.createApplication(
      session.userId,
      parsed.data
    );
    revalidatePath("/dashboard/internships");
    revalidatePath("/dashboard");
    return { success: true, data: created };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create application";
    return { success: false, error: message };
  }
}

/**
 * Update internship application details
 */
export async function updateInternshipAction(
  id: string,
  input: UpdateInternshipInput
): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const parsed = updateInternshipSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid update data",
      };
    }

    const updated = await InternshipsService.updateApplication(
      id,
      session.userId,
      parsed.data
    );
    revalidatePath("/dashboard/internships");
    revalidatePath("/dashboard");
    return { success: true, data: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update application";
    return { success: false, error: message };
  }
}

/**
 * Fast status change (e.g. Move from Applied -> OA -> Interview -> Offer)
 */
export async function updateInternshipStatusAction(
  id: string,
  status: ApplicationStatus
): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const parsed = updateInternshipStatusSchema.safeParse({ status });
    if (!parsed.success) {
      return { success: false, error: "Invalid status value" };
    }

    const updated = await InternshipsService.updateStatus(
      id,
      session.userId,
      parsed.data.status
    );
    revalidatePath("/dashboard/internships");
    revalidatePath("/dashboard");
    return { success: true, data: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update status";
    return { success: false, error: message };
  }
}

/**
 * Delete application
 */
export async function deleteInternshipAction(
  id: string
): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const deleted = await InternshipsService.deleteApplication(id, session.userId);
    if (!deleted) {
      return { success: false, error: "Application not found or unauthorized" };
    }

    revalidatePath("/dashboard/internships");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete application";
    return { success: false, error: message };
  }
}
