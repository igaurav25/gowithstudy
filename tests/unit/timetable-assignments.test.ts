import { describe, it, expect } from "vitest";
import { createTimetableEntrySchema } from "@/schemas/timetable";
import { createAssignmentSchema } from "@/schemas/assignments";
import { TimetableService } from "@/services/timetable-service";

describe("Unit: Timetable & Assignments Schemas & Conflict Detection", () => {
  describe("Timetable Schema Validation", () => {
    it("should accept valid timetable class entry", () => {
      const validEntry = {
        subject: "Compiler Design",
        faculty: "Dr. Arvind",
        day: "Monday" as const,
        startTime: "11:00",
        endTime: "12:15",
        room: "LH-401",
        notes: "Lexical analysis & Lex tool",
      };

      const result = createTimetableEntrySchema.safeParse(validEntry);
      expect(result.success).toBe(true);
    });

    it("should reject invalid time formats", () => {
      const invalidTime = {
        subject: "Compiler Design",
        day: "Monday" as const,
        startTime: "25:00", // invalid hour
        endTime: "26:00",
      };
      expect(createTimetableEntrySchema.safeParse(invalidTime).success).toBe(false);

      const invalidChars = {
        subject: "Compiler Design",
        day: "Monday" as const,
        startTime: "9:00", // missing leading zero
        endTime: "10:00",
      };
      expect(createTimetableEntrySchema.safeParse(invalidChars).success).toBe(false);
    });

    it("should reject when start time is after or equal to end time", () => {
      const reversedTimes = {
        subject: "Compiler Design",
        day: "Monday" as const,
        startTime: "14:00",
        endTime: "13:00",
      };
      const result = createTimetableEntrySchema.safeParse(reversedTimes);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Start time must be earlier than end time");
      }

      const equalTimes = {
        subject: "Compiler Design",
        day: "Monday" as const,
        startTime: "14:00",
        endTime: "14:00",
      };
      expect(createTimetableEntrySchema.safeParse(equalTimes).success).toBe(false);
    });
  });

  describe("Timetable Clash / Conflict Detection", () => {
    const studentId = "usr_student_test_clash";

    it("should detect overlapping class on the same day", async () => {
      // First ensure timetable entries exist
      const weekly = await TimetableService.getWeeklyTimetable(studentId);
      const mondayClass = weekly.find((c) => c.day === "Monday");

      if (mondayClass) {
        // Test an exact overlap
        const clash = await TimetableService.checkTimeClash(
          studentId,
          "Monday",
          mondayClass.startTime,
          mondayClass.endTime
        );
        expect(clash.hasClash).toBe(true);
        expect(clash.conflictingClass).toBeDefined();
        expect(clash.conflictingClass?.subject).toBe(mondayClass.subject);
      }
    });

    it("should report no clash for non-overlapping times or different days", async () => {
      // Sunday evening (no classes) or Tuesday early morning
      const noClash = await TimetableService.checkTimeClash(
        studentId,
        "Monday",
        "06:00",
        "07:00"
      );
      expect(noClash.hasClash).toBe(false);
      expect(noClash.conflictingClass).toBeUndefined();
    });

    it("should exclude current entry ID when checking clash during updates", async () => {
      const weekly = await TimetableService.getWeeklyTimetable(studentId);
      const mondayClass = weekly.find((c) => c.day === "Monday");

      if (mondayClass) {
        // Checking clash against itself with excludeId should return hasClash: false
        const selfCheck = await TimetableService.checkTimeClash(
          studentId,
          "Monday",
          mondayClass.startTime,
          mondayClass.endTime,
          mondayClass.id
        );
        expect(selfCheck.hasClash).toBe(false);
      }
    });
  });

  describe("iCalendar (.ics) Export", () => {
    it("should generate valid VCALENDAR format with PRODID and VEVENT", async () => {
      const ics = await TimetableService.generateIcsCalendar("usr_student_test_clash");

      expect(ics).toContain("BEGIN:VCALENDAR");
      expect(ics).toContain("VERSION:2.0");
      expect(ics).toContain("PRODID:-//CampusFlow//Academic Schedule v1.0//EN");
      expect(ics).toContain("BEGIN:VEVENT");
      expect(ics).toContain("RRULE:FREQ=WEEKLY;BYDAY=");
      expect(ics).toContain("END:VCALENDAR");
    });
  });

  describe("Assignment Schema Validation", () => {
    it("should accept valid assignment creation input", () => {
      const valid = {
        title: "Implement Raft Consensus Protocol",
        subject: "Distributed Systems",
        description: "Write leader election and log replication in Go",
        dueDate: "2026-10-15T23:59:59Z",
        priority: "HIGH" as const,
      };

      const result = createAssignmentSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject assignment with missing title or invalid priority", () => {
      expect(createAssignmentSchema.safeParse({ title: "", subject: "CS" }).success).toBe(false);
      expect(
        createAssignmentSchema.safeParse({
          title: "Test",
          subject: "CS",
          dueDate: "2026-10-15",
          priority: "SUPER_URGENT", // invalid priority enum
        }).success
      ).toBe(false);
    });
  });
});
