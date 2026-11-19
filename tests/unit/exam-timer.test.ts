import { describe, it, expect } from "vitest";
import { ExamTimerService } from "@/services/exam-timer-service";
import { examItemSchema } from "@/schemas/exam-timer";

describe("Unit: Exam Countdown & Pomodoro Focus Timer", () => {
  const testUserId = "usr_student_exam_timer_test";

  describe("getExams & Schema Validation", () => {
    it("should retrieve university exams that satisfy Zod validation", () => {
      const exams = ExamTimerService.getExams(testUserId);
      expect(exams.length).toBeGreaterThanOrEqual(3);

      exams.forEach((exam) => {
        const validation = examItemSchema.safeParse(exam);
        expect(validation.success).toBe(true);
        expect(exam.subject.length).toBeGreaterThan(0);
        expect(exam.courseCode.length).toBeGreaterThan(0);
      });
    });

    it("should return exams sorted in ascending chronological order", () => {
      const exams = ExamTimerService.getExams(testUserId);
      for (let i = 0; i < exams.length - 1; i++) {
        expect(new Date(exams[i].date).getTime()).toBeLessThanOrEqual(
          new Date(exams[i + 1].date).getTime()
        );
      }
    });
  });

  describe("calculateCountdown (Urgency & Days Calculation)", () => {
    const referenceDate = new Date("2026-11-20T10:00:00Z");

    it("should mark urgency as CRITICAL when exam is within 3 days", () => {
      const examDate = new Date("2026-11-22T10:00:00Z"); // 2 days later
      const stats = ExamTimerService.calculateCountdown(examDate, referenceDate);

      expect(stats.days).toBe(2);
      expect(stats.urgency).toBe("CRITICAL");
      expect(stats.hasPassed).toBe(false);
      expect(stats.isToday).toBe(false);
    });

    it("should mark urgency as UPCOMING when exam is between 4 and 14 days", () => {
      const examDate = new Date("2026-11-28T10:00:00Z"); // 8 days later
      const stats = ExamTimerService.calculateCountdown(examDate, referenceDate);

      expect(stats.days).toBe(8);
      expect(stats.urgency).toBe("UPCOMING");
      expect(stats.hasPassed).toBe(false);
    });

    it("should mark urgency as FAR when exam is more than 14 days away", () => {
      const examDate = new Date("2026-12-25T10:00:00Z"); // 35 days later
      const stats = ExamTimerService.calculateCountdown(examDate, referenceDate);

      expect(stats.days).toBe(35);
      expect(stats.urgency).toBe("FAR");
    });

    it("should flag hasPassed and isToday when exam date is in the past", () => {
      const pastExamDate = new Date("2026-11-10T10:00:00Z");
      const stats = ExamTimerService.calculateCountdown(pastExamDate, referenceDate);

      expect(stats.hasPassed).toBe(true);
      expect(stats.days).toBe(0);
      expect(stats.urgency).toBe("CRITICAL");
    });
  });

  describe("addExam", () => {
    it("should allow a student to register a new mid-sem exam", () => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 15);

      const created = ExamTimerService.addExam(testUserId, {
        subject: "Compiler Design",
        courseCode: "CS-305",
        category: "MID_SEM",
        date: targetDate,
        time: "10:00 AM - 12:00 PM",
        venue: "Hall 101",
        targetScore: 90,
        syllabusCompletedPercent: 50,
      });

      expect(created.id).toBeDefined();
      expect(created.subject).toBe("Compiler Design");

      const all = ExamTimerService.getExams(testUserId);
      expect(all.some((e) => e.subject === "Compiler Design")).toBe(true);
    });
  });

  describe("Pomodoro Session Logging", () => {
    it("should log completed study sessions and calculate today's total study minutes", () => {
      const beforeMinutes = ExamTimerService.getTodayStudyMinutes(testUserId);

      ExamTimerService.logPomodoro(testUserId, "Operating Systems", 25);
      ExamTimerService.logPomodoro(testUserId, "Operating Systems", 25);

      const afterMinutes = ExamTimerService.getTodayStudyMinutes(testUserId);
      expect(afterMinutes).toBe(beforeMinutes + 50);
    });
  });
});
