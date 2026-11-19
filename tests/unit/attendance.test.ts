import { describe, it, expect } from "vitest";
import { AttendanceService } from "@/services/attendance-service";

describe("Unit: Attendance Service & Bunk Calculator (75% Universal Rule)", () => {
  const testUserId = "usr_student_att_test";

  describe("calculateBunkStats (75% Rule Engine)", () => {
    it("should calculate correct safe bunks when attendance is well above 75%", () => {
      // 24 attended out of 28 held = 85.7% -> 86%
      // Safe bunks: (24 - 0.75 * 28) / 0.75 = 3 / 0.75 = 4
      const stats = AttendanceService.calculateBunkStats(24, 28, 75);
      expect(stats.percentage).toBe(86);
      expect(stats.status).toBe("SAFE");
      expect(stats.safeBunks).toBe(4);
      expect(stats.classesToRecover).toBe(0);
      expect(stats.bunkAdvice).toContain("safely bunk next 4 classes");
    });

    it("should flag BORDERLINE and 0 safe bunks when attendance is exactly on the 75% threshold", () => {
      // 15 attended out of 20 held = 75%
      // Missing 1 class drops to 15/21 = 71% (< 75%)
      const stats = AttendanceService.calculateBunkStats(15, 20, 75);
      expect(stats.percentage).toBe(75);
      expect(stats.status).toBe("BORDERLINE");
      expect(stats.safeBunks).toBe(0);
      expect(stats.classesToRecover).toBe(0);
      expect(stats.bunkAdvice).toContain("Missing 1 class drops you to 71%");
    });

    it("should accurately calculate recovery classes required to escape debarment when below 75%", () => {
      // 10 attended out of 16 held = 62.5% -> 63% (< 75%)
      // Recovery formula: (0.75 * 16 - 10) / (1 - 0.75) = 2 / 0.25 = 8 consecutive classes
      // Check: (10 + 8) / (16 + 8) = 18 / 24 = 75%
      const stats = AttendanceService.calculateBunkStats(10, 16, 75);
      expect(stats.percentage).toBe(63);
      expect(stats.status).toBe("DANGER");
      expect(stats.safeBunks).toBe(0);
      expect(stats.classesToRecover).toBe(8);
      expect(stats.bunkAdvice).toContain("Debar Risk! Attend next 8 consecutive classes");
    });

    it("should handle edge case when 0 classes have been conducted yet", () => {
      const stats = AttendanceService.calculateBunkStats(0, 0, 75);
      expect(stats.percentage).toBe(100);
      expect(stats.status).toBe("SAFE");
      expect(stats.safeBunks).toBe(0);
      expect(stats.classesToRecover).toBe(0);
    });
  });

  describe("Attendance User Operations & Persistence", () => {
    it("should initialize default semester subjects for a student", async () => {
      const summary = await AttendanceService.getAttendance(testUserId);
      expect(summary.subjects.length).toBeGreaterThanOrEqual(4);
      expect(summary.overallPercentage).toBeGreaterThanOrEqual(70);
      expect(summary.totalConducted).toBeGreaterThan(0);
      expect(summary.totalAttended).toBeLessThanOrEqual(summary.totalConducted);
    });

    it("should increment both attended and total when marking PRESENT", async () => {
      const initial = await AttendanceService.getAttendance(testUserId);
      const targetSubj = initial.subjects[0];
      const initialAttended = targetSubj.attended;
      const initialTotal = targetSubj.total;

      const updated = await AttendanceService.markAttendance(
        testUserId,
        targetSubj.subject,
        "PRESENT"
      );

      expect(updated.attended).toBe(initialAttended + 1);
      expect(updated.total).toBe(initialTotal + 1);
    });

    it("should increment only total and decrement percentage when marking ABSENT", async () => {
      const initial = await AttendanceService.getAttendance(testUserId);
      const targetSubj = initial.subjects[0];
      const initialAttended = targetSubj.attended;
      const initialTotal = targetSubj.total;

      const updated = await AttendanceService.markAttendance(
        testUserId,
        targetSubj.subject,
        "ABSENT"
      );

      expect(updated.attended).toBe(initialAttended);
      expect(updated.total).toBe(initialTotal + 1);
    });

    it("should allow manual sync of attendance numbers from university ERP portal", async () => {
      const initial = await AttendanceService.getAttendance(testUserId);
      const targetSubj = initial.subjects[0];

      const updated = await AttendanceService.updateSubject(testUserId, {
        subjectId: targetSubj.id,
        attended: 30,
        total: 32,
      });

      expect(updated.attended).toBe(30);
      expect(updated.total).toBe(32);
      expect(updated.percentage).toBe(94);
      expect(updated.status).toBe("SAFE");
    });

    it("should add a new elective subject and update overall metrics", async () => {
      const initial = await AttendanceService.getAttendance(testUserId);
      const prevCount = initial.subjects.length;

      const newSubj = await AttendanceService.addSubject(testUserId, {
        subject: "Cloud Computing & DevOps",
        code: "CS-308",
        attended: 18,
        total: 20,
        targetPercentage: 75,
      });

      expect(newSubj.subject).toBe("Cloud Computing & DevOps");
      expect(newSubj.percentage).toBe(90);

      const after = await AttendanceService.getAttendance(testUserId);
      expect(after.subjects.length).toBe(prevCount + 1);
    });

    it("should return the overall attendance percentage directly", async () => {
      const overall = await AttendanceService.getOverallPercentage(testUserId);
      expect(overall).toBeGreaterThanOrEqual(0);
      expect(overall).toBeLessThanOrEqual(100);
    });
  });
});
