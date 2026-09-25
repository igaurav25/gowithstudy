import { describe, it, expect } from "vitest";
import { SemanticRetriever } from "@/lib/rag/retriever";
import { CORE_CSE_SEMANTIC_CHUNKS } from "@/lib/rag/chunker";
import { askQuestionSchema, generateQuizSchema } from "@/schemas/ai";
import { AIService } from "@/services/ai-service";

describe("Unit: AI Assistant & RAG Semantic Retrieval", () => {
  describe("Zod Validation & Input Rules", () => {
    it("should accept valid academic questions", () => {
      const valid = {
        query: "What is the difference between TCP and UDP?",
        mode: "EXPLAIN" as const,
        noteId: "ALL",
      };
      expect(askQuestionSchema.safeParse(valid).success).toBe(true);
    });

    it("should reject empty or single-character questions", () => {
      expect(askQuestionSchema.safeParse({ query: "" }).success).toBe(false);
      expect(askQuestionSchema.safeParse({ query: "a" }).success).toBe(false);
      expect(askQuestionSchema.safeParse({ query: "   " }).success).toBe(false);
    });

    it("should reject questions exceeding maximum character length", () => {
      const longQuery = "a".repeat(1001);
      expect(askQuestionSchema.safeParse({ query: longQuery }).success).toBe(false);
    });

    it("should validate quiz generation input", () => {
      expect(generateQuizSchema.safeParse({ noteId: "note_os_01" }).success).toBe(true);
      expect(generateQuizSchema.safeParse({ noteId: "" }).success).toBe(false);
      expect(generateQuizSchema.safeParse({ noteId: "note_os_01", count: 20 }).success).toBe(false); // max is 10
    });
  });

  describe("SemanticRetriever Engine", () => {
    it("should have pre-indexed Computer Science knowledge base chunks", () => {
      expect(CORE_CSE_SEMANTIC_CHUNKS.length).toBeGreaterThan(0);
      const subjects = new Set(CORE_CSE_SEMANTIC_CHUNKS.map((c) => c.subject));
      expect(subjects.has("Operating Systems")).toBe(true);
      expect(subjects.has("Database Management Systems")).toBe(true);
      expect(subjects.has("Computer Networks")).toBe(true);
    });

    it("should retrieve relevant chunks and citations for OS Deadlock query", () => {
      const result = SemanticRetriever.retrieve(
        "How does Banker's Algorithm prevent deadlock in Operating Systems?",
        "ALL",
        3
      );

      expect(result.chunks.length).toBeGreaterThan(0);
      expect(result.isGroundedInDocument).toBe(true);
      expect(result.citations.length).toBeGreaterThan(0);

      // Top chunk should discuss Operating Systems or deadlocks
      const topChunk = result.chunks[0];
      expect(topChunk.subject).toBe("Operating Systems");
      expect(topChunk.content.toLowerCase()).toContain("deadlock");
    });

    it("should retrieve relevant chunks for DBMS Normalization & BCNF query", () => {
      const result = SemanticRetriever.retrieve(
        "Explain BCNF and 3NF normalization functional dependencies in DBMS",
        "ALL",
        3
      );

      expect(result.chunks.length).toBeGreaterThan(0);
      expect(result.isGroundedInDocument).toBe(true);
      const topChunk = result.chunks[0];
      expect(topChunk.subject).toBe("Database Management Systems");
    });

    it("should filter candidates by targetNoteId when specified", () => {
      const targetId = "note_dbms_02";
      const result = SemanticRetriever.retrieve(
        "normalization forms BCNF",
        targetId,
        2
      );

      for (const chunk of result.chunks) {
        expect(chunk.noteId).toBe(targetId);
      }
    });

    it("should handle queries with zero matches gracefully", () => {
      const result = SemanticRetriever.retrieve(
        "xylophone quantum astronaut recipe cooking",
        "non-existent-note-id",
        3
      );

      expect(result.chunks).toEqual([]);
      expect(result.citations).toEqual([]);
      expect(result.isGroundedInDocument).toBe(false);
    });
  });

  describe("AIService Error Handling & Grounded Response", () => {
    const testUserId = "usr_student_01";

    it("should generate grounded semantic response without throwing errors", async () => {
      const response = await AIService.queryAssistant(testUserId, {
        query: "What is Peterson's solution for critical section problem?",
        noteId: "ALL",
        mode: "EXPLAIN",
        history: [],
      });

      expect(response).toBeDefined();
      expect(response.role).toBe("assistant");
      expect(response.content.length).toBeGreaterThan(20);
      expect(response.citations.length).toBeGreaterThan(0);
    });

    it("should generate multiple-choice quiz questions for a note", async () => {
      const quiz = await AIService.generateQuizForNote(testUserId, "note_os_01");

      expect(quiz).toBeDefined();
      expect(quiz.mode).toBe("QUIZ");
      expect(quiz.quizQuestions).toBeDefined();
      expect(quiz.quizQuestions!.length).toBeGreaterThan(0);

      for (const q of quiz.quizQuestions!) {
        expect(q.question).toBeDefined();
        expect(q.options.length).toBe(4);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(4);
        expect(q.explanation).toBeDefined();
      }
    });
  });
});
