import { describe, it, expect } from "vitest";
import { FlashcardService } from "@/services/flashcard-service";
import { studyDeckSchema } from "@/schemas/flashcard";

describe("Unit: AI Flashcards & Exam Quiz (Spaced Repetition & Recall Engine)", () => {
  const testUserId = "usr_student_flashcard_test";

  describe("getDecks & Schema Compliance", () => {
    it("should provide high-yield university engineering study decks that satisfy Zod validation", () => {
      const decks = FlashcardService.getDecks(testUserId);
      expect(decks.length).toBeGreaterThanOrEqual(3);

      decks.forEach((deck) => {
        const parseRes = studyDeckSchema.safeParse(deck);
        expect(parseRes.success).toBe(true);
        expect(deck.cards.length).toBeGreaterThan(0);
        expect(deck.quizzes.length).toBeGreaterThan(0);
      });
    });

    it("should find an existing deck by ID", () => {
      const deck = FlashcardService.getDeckById(testUserId, "deck_os_core");
      expect(deck).not.toBeNull();
      expect(deck?.subject).toBe("Operating Systems");
      expect(deck?.cards.length).toBe(5);
    });

    it("should return null for non-existent deck ID", () => {
      const deck = FlashcardService.getDeckById(testUserId, "non_existent_deck");
      expect(deck).toBeNull();
    });
  });

  describe("recordReview (Spaced Repetition Intervals)", () => {
    it("should reset interval to 1 day and mark difficulty HARD when student rates AGAIN", () => {
      const updated = FlashcardService.recordReview(
        testUserId,
        "deck_os_core",
        "fc_os_1",
        "AGAIN"
      );
      expect(updated.intervalDays).toBe(1);
      expect(updated.difficulty).toBe("HARD");
      expect(updated.repetitionCount).toBeGreaterThanOrEqual(1);
      expect(updated.lastReviewedAt).toBeDefined();
    });

    it("should moderately increase interval when student rates GOOD", () => {
      const updated = FlashcardService.recordReview(
        testUserId,
        "deck_os_core",
        "fc_os_2",
        "GOOD"
      );
      expect(updated.intervalDays).toBeGreaterThanOrEqual(2);
      expect(updated.difficulty).toBe("MEDIUM");
    });

    it("should significantly boost review interval when student rates EASY", () => {
      const updated = FlashcardService.recordReview(
        testUserId,
        "deck_os_core",
        "fc_os_4",
        "EASY"
      );
      expect(updated.intervalDays).toBeGreaterThanOrEqual(4);
      expect(updated.difficulty).toBe("EASY");
    });

    it("should throw error if deck or card is not found", () => {
      expect(() =>
        FlashcardService.recordReview(testUserId, "invalid_deck", "fc_1", "GOOD")
      ).toThrow("Study deck not found.");

      expect(() =>
        FlashcardService.recordReview(testUserId, "deck_os_core", "invalid_card", "GOOD")
      ).toThrow("Flashcard not found.");
    });
  });

  describe("generateStudySet (AI Synthesis from Notes)", () => {
    it("should synthesize flashcards and multiple-choice questions from lecture text", async () => {
      const lectureNotes = `
        B+ Trees maintain all actual record pointers in leaf nodes.
        Internal nodes only store router keys to guide search operations.
        Leaf nodes are doubly linked, which enables sequential range queries in O(log N + K) time.
        In contrast, standard B-trees store record pointers across all levels of the tree.
      `;

      const generated = await FlashcardService.generateStudySet(testUserId, {
        subject: "Database Management Systems",
        noteTitle: "B+ Tree Indexing Deep Dive",
        notesText: lectureNotes,
        cardCount: 4,
      });

      expect(generated.subject).toBe("Database Management Systems");
      expect(generated.title).toBe("B+ Tree Indexing Deep Dive");
      expect(generated.cards.length).toBeGreaterThanOrEqual(3);
      expect(generated.quizzes.length).toBeGreaterThanOrEqual(2);

      // Verify quiz structure
      const firstQuiz = generated.quizzes[0];
      expect(firstQuiz.options.length).toBe(4);
      expect(firstQuiz.correctIndex).toBeGreaterThanOrEqual(0);
      expect(firstQuiz.correctIndex).toBeLessThanOrEqual(3);
      expect(firstQuiz.explanation.length).toBeGreaterThan(10);
    });
  });
});
