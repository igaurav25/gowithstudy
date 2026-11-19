import { describe, it, expect } from "vitest";
import { PYQService } from "@/services/pyq-service";
import { pyqPaperSchema } from "@/schemas/pyq";

describe("Unit: Previous Year Questions (PYQs) Service & Solver", () => {
  describe("getPapers & Schema Compliance", () => {
    it("should return authentic university question papers that pass Zod schema validation", () => {
      const papers = PYQService.getPapers();
      expect(papers.length).toBeGreaterThanOrEqual(4);

      papers.forEach((paper) => {
        const result = pyqPaperSchema.safeParse(paper);
        expect(result.success).toBe(true);
        expect(paper.questions.length).toBeGreaterThan(0);
      });
    });

    it("should filter papers by subject", () => {
      const osPapers = PYQService.getPapers({ subject: "Operating Systems" });
      expect(osPapers.length).toBeGreaterThanOrEqual(1);
      osPapers.forEach((p) => {
        expect(p.subject.toLowerCase()).toContain("operating systems");
      });
    });

    it("should filter papers by semester", () => {
      const sem5Papers = PYQService.getPapers({ semester: 5 });
      expect(sem5Papers.length).toBeGreaterThanOrEqual(1);
      sem5Papers.forEach((p) => {
        expect(p.semester).toBe(5);
      });
    });

    it("should filter papers by exam type (END_SEM vs MID_SEM)", () => {
      const endSemPapers = PYQService.getPapers({ examType: "END_SEM" });
      expect(endSemPapers.length).toBeGreaterThanOrEqual(1);
      endSemPapers.forEach((p) => {
        expect(p.examType).toBe("END_SEM");
      });
    });

    it("should search papers by question text or topic tags", () => {
      const deadlockResults = PYQService.getPapers({ search: "Deadlock" });
      expect(deadlockResults.length).toBeGreaterThanOrEqual(1);
      expect(deadlockResults[0].subject).toBe("Operating Systems");

      const treeResults = PYQService.getPapers({ search: "B+ Tree" });
      expect(treeResults.length).toBeGreaterThanOrEqual(1);
      expect(treeResults[0].subject).toBe("Database Management Systems");
    });
  });

  describe("getPaperById", () => {
    it("should retrieve a paper when given a valid paperId", () => {
      const paper = PYQService.getPaperById("pyq_os_2023");
      expect(paper).not.toBeNull();
      expect(paper?.subject).toBe("Operating Systems");
      expect(paper?.courseCode).toBe("CS-301");
    });

    it("should return null when paperId does not exist", () => {
      const paper = PYQService.getPaperById("non_existent_paper_id");
      expect(paper).toBeNull();
    });
  });

  describe("solveQuestion (AI Examination Solution Engine)", () => {
    it("should return pre-verified academic answer if available", async () => {
      const solution = await PYQService.solveQuestion("pyq_os_2023", "q_os_2");
      expect(solution.topicTag).toBe("Deadlocks");
      expect(solution.marks).toBe(4);
      expect(solution.answer).toContain("Coffman's 4 Necessary & Sufficient Conditions");
      expect(solution.answer).toContain("Mutual Exclusion");
      expect(solution.answer).toContain("Circular Wait");
    });

    it("should dynamically synthesize structured syllabus-grounded answer when pre-verified answer is not present", async () => {
      const solution = await PYQService.solveQuestion("pyq_os_2023", "q_os_4");
      expect(solution.topicTag).toBe("Virtual Memory");
      expect(solution.marks).toBe(6);
      expect(solution.answer).toContain("Model University Examination Solution");
      expect(solution.answer).toContain("Core Concept & Formal Definition");
      expect(solution.answer).toContain("Examiner Tip & Scoring Advice");
    });

    it("should throw an error if paperId is invalid", async () => {
      await expect(
        PYQService.solveQuestion("invalid_paper", "q_os_1")
      ).rejects.toThrow("Question paper not found.");
    });

    it("should throw an error if questionId does not exist within the paper", async () => {
      await expect(
        PYQService.solveQuestion("pyq_os_2023", "non_existent_q")
      ).rejects.toThrow("Question not found in paper.");
    });
  });
});
