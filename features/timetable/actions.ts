"use server";

import { getSession } from "@/lib/auth";
import { TimetableService, TimetableItem } from "@/services/timetable-service";
import {
  createTimetableEntrySchema,
  updateTimetableEntrySchema,
  CreateTimetableEntryInput,
  UpdateTimetableEntryInput,
} from "@/schemas/timetable";
import { ActionResult } from "@/features/auth/actions";
import { revalidatePath } from "next/cache";

/**
 * Server action to add a lecture/lab to student timetable
 */
export async function createTimetableEntryAction(
  input: CreateTimetableEntryInput
): Promise<ActionResult<TimetableItem>> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  const validation = createTimetableEntrySchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Validation failed",
    };
  }

  try {
    const entry = await TimetableService.createEntry(session.userId, validation.data);
    revalidatePath("/dashboard/timetable");
    revalidatePath("/dashboard");
    return {
      success: true,
      message: "Class added to timetable successfully!",
      data: entry,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to add class",
    };
  }
}

/**
 * Server action to update existing timetable entry
 */
export async function updateTimetableEntryAction(
  id: string,
  input: UpdateTimetableEntryInput
): Promise<ActionResult<TimetableItem>> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  const validation = updateTimetableEntrySchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Validation failed",
    };
  }

  try {
    const updated = await TimetableService.updateEntry(id, session.userId, validation.data);
    revalidatePath("/dashboard/timetable");
    revalidatePath("/dashboard");
    return {
      success: true,
      message: "Class details updated successfully!",
      data: updated,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to update class",
    };
  }
}

/**
 * Server action to delete class from timetable
 */
export async function deleteTimetableEntryAction(id: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  try {
    const success = await TimetableService.deleteEntry(id, session.userId);
    if (!success) {
      return { success: false, message: "Class not found or already deleted" };
    }
    revalidatePath("/dashboard/timetable");
    revalidatePath("/dashboard");
    return {
      success: true,
      message: "Class removed from timetable",
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to remove class",
    };
  }
}
