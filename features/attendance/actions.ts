"use server";

import { getSession } from "@/lib/auth";
import { AttendanceService } from "@/services/attendance-service";
import { ActionResult } from "@/features/auth/actions";
import {
  OverallAttendanceSummary,
  SubjectComputedStats,
  markAttendanceSchema,
  createSubjectAttendanceSchema,
  updateSubjectAttendanceSchema,
  MarkAttendanceInput,
  CreateSubjectAttendanceInput,
  UpdateSubjectAttendanceInput,
} from "@/schemas/attendance";
import { revalidatePath } from "next/cache";

/**
 * Fetch current user's attendance metrics and bunk recommendations
 */
export async function getAttendanceAction(): Promise<
  ActionResult<OverallAttendanceSummary>
> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  try {
    const data = await AttendanceService.getAttendance(session.userId);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to load attendance records.",
    };
  }
}

/**
 * Mark daily attendance (Present or Absent) for a class
 */
export async function markAttendanceAction(
  input: MarkAttendanceInput
): Promise<ActionResult<SubjectComputedStats>> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  const validation = markAttendanceSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Invalid input data",
    };
  }

  try {
    const updated = await AttendanceService.markAttendance(
      session.userId,
      validation.data.subject,
      validation.data.status
    );
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/attendance");
    revalidatePath("/dashboard/timetable");
    return {
      success: true,
      message:
        validation.data.status === "PRESENT"
          ? `Marked Present for ${updated.subject} ✅`
          : `Marked Absent for ${updated.subject} ❌`,
      data: updated,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to mark attendance.",
    };
  }
}

/**
 * Update numbers for a subject (e.g. from college portal sync)
 */
export async function updateSubjectAttendanceAction(
  input: UpdateSubjectAttendanceInput
): Promise<ActionResult<SubjectComputedStats>> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  const validation = updateSubjectAttendanceSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Invalid update input",
    };
  }

  try {
    const updated = await AttendanceService.updateSubject(
      session.userId,
      validation.data
    );
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/attendance");
    return {
      success: true,
      message: `Updated attendance for ${updated.subject}`,
      data: updated,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to update subject.",
    };
  }
}

/**
 * Add a new subject to track
 */
export async function addSubjectAttendanceAction(
  input: CreateSubjectAttendanceInput
): Promise<ActionResult<SubjectComputedStats>> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  const validation = createSubjectAttendanceSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Invalid subject input",
    };
  }

  try {
    const created = await AttendanceService.addSubject(
      session.userId,
      validation.data
    );
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/attendance");
    return {
      success: true,
      message: `Added ${created.subject} to attendance tracker!`,
      data: created,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to add subject.",
    };
  }
}

/**
 * Delete a subject
 */
export async function deleteSubjectAttendanceAction(
  subjectId: string
): Promise<ActionResult<boolean>> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  try {
    await AttendanceService.deleteSubject(session.userId, subjectId);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/attendance");
    return { success: true, message: "Subject removed from tracking." };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to delete subject.",
    };
  }
}
