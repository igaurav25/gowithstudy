"use server";

import { getSession } from "@/lib/auth";
import { TutorService } from "@/services/tutor/tutor-service";
import {
  TutorCourse,
  StudentTutorProgress,
  TutorInteractionResponse,
  TutorDifficulty,
  TeachingLanguage,
} from "@/services/tutor/types";
import { ActionResult } from "@/features/auth/actions";
import { z } from "zod";

const startCourseSchema = z.object({
  courseId: z.string().optional(),
  noteId: z.string().default("note_os_01"),
  targetLevel: z
    .enum(["BEGINNER", "COLLEGE_BTECH", "EXAM_LEVEL", "INTERVIEW_LEVEL", "ADVANCED"])
    .default("COLLEGE_BTECH"),
  preferredLanguage: z.enum(["en", "hi", "hinglish", "es", "auto"]).default("auto"),
});

/**
 * Initializes or loads an interactive AI Tutor course
 */
export async function startTutorCourseAction(
  input: z.infer<typeof startCourseSchema>
): Promise<
  ActionResult<{
    course: TutorCourse;
    progress: StudentTutorProgress;
    interaction: TutorInteractionResponse;
  }>
> {
  const session = await getSession();
  const userId = session?.userId || "student_user";

  const validation = startCourseSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Invalid course parameters",
    };
  }

  try {
    const data = await TutorService.startOrResumeCourse(
      userId,
      validation.data.courseId,
      validation.data.noteId,
      {
        targetLevel: validation.data.targetLevel as TutorDifficulty,
        preferredLanguage: validation.data.preferredLanguage as TeachingLanguage,
      }
    );
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to launch course.",
    };
  }
}

/**
 * Advances the active lesson to the next pedagogical step
 */
export async function nextTutorStepAction(
  courseId: string
): Promise<ActionResult<TutorInteractionResponse>> {
  const session = await getSession();
  const userId = session?.userId || "student_user";

  if (!courseId) return { success: false, message: "Course ID is required." };

  try {
    const data = await TutorService.nextStep(userId, courseId);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to advance step.",
    };
  }
}

/**
 * Evaluates student answer to the check-for-understanding quiz
 */
export async function evaluateTutorAnswerAction(
  courseId: string,
  answerIndex: number
): Promise<ActionResult<TutorInteractionResponse>> {
  const session = await getSession();
  const userId = session?.userId || "student_user";

  if (!courseId || answerIndex === undefined) {
    return { success: false, message: "Course ID and answer selection required." };
  }

  try {
    const data = await TutorService.evaluateAnswer(userId, courseId, answerIndex);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to evaluate answer.",
    };
  }
}

/**
 * Handles any question/interruption from the student during a lesson
 */
export async function askTutorQuestionAction(
  courseId: string,
  studentQuestion: string
): Promise<ActionResult<TutorInteractionResponse>> {
  const session = await getSession();
  const userId = session?.userId || "student_user";

  if (!courseId || !studentQuestion.trim()) {
    return { success: false, message: "Please enter your question." };
  }

  try {
    const data = await TutorService.handleInterruption(userId, courseId, studentQuestion);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to answer question.",
    };
  }
}

/**
 * Resumes lesson from paused state after student interruption
 */
export async function resumeTutorLessonAction(
  courseId: string
): Promise<ActionResult<TutorInteractionResponse>> {
  const session = await getSession();
  const userId = session?.userId || "student_user";

  if (!courseId) return { success: false, message: "Course ID required." };

  try {
    const data = await TutorService.resumeLesson(userId, courseId);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to resume lesson.",
    };
  }
}
