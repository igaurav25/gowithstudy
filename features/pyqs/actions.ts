"use server";

import { getSession } from "@/lib/auth";
import { PYQService } from "@/services/pyq-service";
import { PYQPaperItem, PYQFilterInput, pyqFilterSchema } from "@/schemas/pyq";
import { ActionResult } from "@/features/auth/actions";

/**
 * Fetch list of PYQ papers matching filters
 */
export async function getPYQPapersAction(
  filter?: PYQFilterInput
): Promise<ActionResult<PYQPaperItem[]>> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  const validation = pyqFilterSchema.safeParse(filter || {});
  if (!validation.success) {
    return { success: false, message: "Invalid filter parameters." };
  }

  try {
    const papers = PYQService.getPapers(validation.data);
    return { success: true, data: papers };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to load question papers.",
    };
  }
}

/**
 * Generate AI-grounded model examination solution for a question
 */
export async function solvePYQQuestionAction(
  paperId: string,
  questionId: string
): Promise<ActionResult<{ answer: string; topicTag: string; marks: number }>> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  try {
    const result = await PYQService.solveQuestion(paperId, questionId);
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to solve question.",
    };
  }
}
