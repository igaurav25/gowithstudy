"use server";

import { getSession } from "@/lib/auth";
import { AssignmentsService, AssignmentItem } from "@/services/assignments-service";
import {
  createAssignmentSchema,
  updateAssignmentSchema,
  CreateAssignmentInput,
  UpdateAssignmentInput,
} from "@/schemas/assignments";
import { ActionResult } from "@/features/auth/actions";
import { revalidatePath } from "next/cache";

/**
 * Server action to create a new assignment task
 */
export async function createAssignmentAction(
  input: CreateAssignmentInput
): Promise<ActionResult<AssignmentItem>> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  const validation = createAssignmentSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Validation failed",
    };
  }

  try {
    const created = await AssignmentsService.createAssignment(
      session.userId,
      validation.data
    );
    revalidatePath("/dashboard/assignments");
    revalidatePath("/dashboard");
    return {
      success: true,
      message: "Assignment created successfully!",
      data: created,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to create assignment",
    };
  }
}

/**
 * Server action to update existing assignment
 */
export async function updateAssignmentAction(
  id: string,
  input: UpdateAssignmentInput
): Promise<ActionResult<AssignmentItem>> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  const validation = updateAssignmentSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Validation failed",
    };
  }

  try {
    const updated = await AssignmentsService.updateAssignment(
      id,
      session.userId,
      validation.data
    );
    revalidatePath("/dashboard/assignments");
    revalidatePath("/dashboard");
    return {
      success: true,
      message: "Assignment updated successfully!",
      data: updated,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to update assignment",
    };
  }
}

/**
 * Server action to toggle completion status of an assignment
 */
export async function toggleAssignmentStatusAction(
  id: string
): Promise<ActionResult<AssignmentItem>> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  try {
    const updated = await AssignmentsService.toggleStatus(id, session.userId);
    revalidatePath("/dashboard/assignments");
    revalidatePath("/dashboard");
    return {
      success: true,
      message:
        updated.status === "COMPLETED"
          ? "🎉 Assignment marked as completed!"
          : "Assignment marked as pending.",
      data: updated,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to update assignment status",
    };
  }
}

/**
 * Server action to delete an assignment
 */
export async function deleteAssignmentAction(id: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  try {
    const success = await AssignmentsService.deleteAssignment(id, session.userId);
    if (!success) {
      return { success: false, message: "Assignment not found or already deleted" };
    }
    revalidatePath("/dashboard/assignments");
    revalidatePath("/dashboard");
    return {
      success: true,
      message: "Assignment deleted successfully!",
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to delete assignment",
    };
  }
}
