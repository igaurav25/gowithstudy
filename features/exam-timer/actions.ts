"use server";

import { getSession } from "@/lib/auth";
import { ExamTimerService } from "@/services/exam-timer-service";
import {
  ExamItem,
  examItemSchema,
  PomodoroLog,
} from "@/schemas/exam-timer";
import { ActionResult } from "@/features/auth/actions";
import { z } from "zod";

const createExamSchema = examItemSchema.omit({ id: true });

/**
 * Fetch student exams
 */
export async function getExamsAction(): Promise<ActionResult<ExamItem[]>> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  try {
    const exams = ExamTimerService.getExams(session.userId);
    return { success: true, data: exams };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to load exams.",
    };
  }
}

/**
 * Add a new university exam
 */
export async function addExamAction(
  data: z.infer<typeof createExamSchema>
): Promise<ActionResult<ExamItem>> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  const validation = createExamSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Invalid exam data.",
    };
  }

  try {
    const exam = ExamTimerService.addExam(session.userId, validation.data);
    return { success: true, data: exam };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to add exam.",
    };
  }
}

/**
 * Log a completed Pomodoro study session
 */
export async function logPomodoroSessionAction(
  subject: string,
  durationMinutes: number
): Promise<ActionResult<PomodoroLog>> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  if (durationMinutes < 1 || durationMinutes > 180) {
    return { success: false, message: "Duration must be between 1 and 180 minutes." };
  }

  try {
    const log = ExamTimerService.logPomodoro(
      session.userId,
      subject || "General Engineering Study",
      durationMinutes
    );
    return { success: true, data: log };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to log study session.",
    };
  }
}
