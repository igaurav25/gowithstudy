"use server";

import { getSession } from "@/lib/auth";
import { UniversalSearchService } from "@/services/search/search-service";
import { UniversalSearchResponse } from "@/services/search/types";
import { ActionResult } from "@/features/auth/actions";
import { z } from "zod";

const searchInputSchema = z.object({
  query: z
    .string()
    .trim()
    .min(2, "Search query must be at least 2 characters")
    .max(1000, "Search query cannot exceed 1000 characters"),
  targetNoteId: z.string().optional().default("ALL"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
});

export type SearchInput = z.infer<typeof searchInputSchema>;

/**
 * Universal Search server action
 */
export async function searchAction(
  input: SearchInput
): Promise<ActionResult<UniversalSearchResponse>> {
  const session = await getSession();
  const userId = session?.userId || "anonymous_student";

  const validation = searchInputSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Invalid search query",
    };
  }

  try {
    const result = await UniversalSearchService.search(validation.data.query, {
      userId,
      targetNoteId: validation.data.targetNoteId,
      history: validation.data.history,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Search query failed.",
    };
  }
}
