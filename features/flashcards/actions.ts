"use server";

import { getSession } from "@/lib/auth";
import { FlashcardService } from "@/services/flashcard-service";
import {
  StudyDeck,
  FlashcardItem,
  FlashcardRating,
  flashcardRatingSchema,
  GenerateStudySetInput,
  generateStudySetSchema,
} from "@/schemas/flashcard";
import { ActionResult } from "@/features/auth/actions";

/**
 * Fetch all decks available to student
 */
export async function getStudyDecksAction(): Promise<ActionResult<StudyDeck[]>> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  try {
    const decks = FlashcardService.getDecks(session.userId);
    return { success: true, data: decks };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to load study decks.",
    };
  }
}

/**
 * Record spaced repetition review for a card
 */
export async function reviewFlashcardAction(
  deckId: string,
  cardId: string,
  rating: FlashcardRating
): Promise<ActionResult<FlashcardItem>> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  const parseRating = flashcardRatingSchema.safeParse(rating);
  if (!parseRating.success) {
    return { success: false, message: "Invalid rating value." };
  }

  try {
    const updatedCard = FlashcardService.recordReview(
      session.userId,
      deckId,
      cardId,
      parseRating.data
    );
    return { success: true, data: updatedCard };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to record card review.",
    };
  }
}

/**
 * Generate AI study flashcards and quiz from lecture notes
 */
export async function generateStudySetAction(
  input: GenerateStudySetInput
): Promise<ActionResult<StudyDeck>> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  const validation = generateStudySetSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Invalid input parameters.",
    };
  }

  try {
    const deck = await FlashcardService.generateStudySet(
      session.userId,
      validation.data
    );
    return { success: true, data: deck };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to generate study set.",
    };
  }
}
