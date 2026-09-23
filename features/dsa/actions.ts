"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { DSAService } from "@/services/dsa-service";
import {
  createDSAProblemSchema,
  updateDSAProblemSchema,
  CreateDSAProblemInput,
  UpdateDSAProblemInput,
  DSAStatus,
} from "@/schemas/dsa";

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Toggle problem solve status (SOLVED <-> UNSOLVED)
 */
export async function toggleDSAStatusAction(
  problemId: string,
  desiredStatus?: DSAStatus
): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const updated = await DSAService.toggleSolveStatus(
      problemId,
      session.userId,
      desiredStatus
    );
    revalidatePath("/dashboard/placement");
    revalidatePath("/dashboard");
    return { success: true, data: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to toggle status";
    return { success: false, error: message };
  }
}

/**
 * Toggle revision bookmark flag
 */
export async function toggleDSARevisionAction(
  problemId: string
): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const updated = await DSAService.toggleRevisionFlag(problemId, session.userId);
    revalidatePath("/dashboard/placement");
    return { success: true, data: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to toggle revision";
    return { success: false, error: message };
  }
}

/**
 * Create a new custom DSA problem
 */
export async function createDSAProblemAction(
  input: CreateDSAProblemInput
): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const parsed = createDSAProblemSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid problem input",
      };
    }

    const created = await DSAService.createProblem(session.userId, parsed.data);
    revalidatePath("/dashboard/placement");
    revalidatePath("/dashboard");
    return { success: true, data: created };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to add problem";
    return { success: false, error: message };
  }
}

/**
 * Update DSA problem details / notes
 */
export async function updateDSAProblemAction(
  problemId: string,
  input: UpdateDSAProblemInput
): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const parsed = updateDSAProblemSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid update input",
      };
    }

    const updated = await DSAService.updateProblem(
      problemId,
      session.userId,
      parsed.data
    );
    revalidatePath("/dashboard/placement");
    revalidatePath("/dashboard");
    return { success: true, data: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update problem";
    return { success: false, error: message };
  }
}

/**
 * Delete a custom problem
 */
export async function deleteDSAProblemAction(
  problemId: string
): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const deleted = await DSAService.deleteProblem(problemId, session.userId);
    if (!deleted) {
      return { success: false, error: "Problem not found or unauthorized" };
    }

    revalidatePath("/dashboard/placement");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete problem";
    return { success: false, error: message };
  }
}
