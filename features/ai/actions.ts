"use server";

import { getSession } from "@/lib/auth";
import { AIService } from "@/services/ai-service";
import { AIMessage } from "@/lib/rag/types";
import {
  askQuestionSchema,
  generateQuizSchema,
  generateSummarySchema,
  AskQuestionInput,
} from "@/schemas/ai";
import { ActionResult } from "@/features/auth/actions";

/**
 * Ask a study question grounded in selected student documents
 */
export async function askAssistantAction(
  input: AskQuestionInput
): Promise<ActionResult<AIMessage>> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  const validation = askQuestionSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Invalid input query",
    };
  }

  try {
    const aiResponse = await AIService.queryAssistant(session.userId, validation.data);
    return {
      success: true,
      data: aiResponse,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to query AI assistant.",
    };
  }
}

/**
 * Generate an interactive practice quiz for a study material
 */
export async function generateQuizAction(
  noteId: string
): Promise<ActionResult<AIMessage>> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  const validation = generateQuizSchema.safeParse({ noteId });
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Invalid note selection",
    };
  }

  try {
    const quizResponse = await AIService.generateQuizForNote(session.userId, noteId);
    return {
      success: true,
      data: quizResponse,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to generate quiz.",
    };
  }
}

/**
 * Generate a revision summary / cheatsheet for a study material
 */
export async function generateSummaryAction(
  noteId: string
): Promise<ActionResult<AIMessage>> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  const validation = generateSummarySchema.safeParse({ noteId });
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Invalid note selection",
    };
  }

  try {
    const summaryResponse = await AIService.generateSummaryForNote(session.userId, noteId);
    return {
      success: true,
      data: summaryResponse,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to generate summary.",
    };
  }
}
