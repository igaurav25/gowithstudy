import { describe, it, expect } from "vitest";
import { AssignmentsService } from "@/services/assignments-service";
import { TimetableService } from "@/services/timetable-service";

describe("Integration: Assignments & Timetable CRUD Lifecycle", () => {
  const testStudentId = "usr_student_academic_test";

  let createdAssignmentId = "";
  let createdClassId = "";

  describe("Assignments CRUD & Stats Tracking", () => {
    it("Step 1: Should create a new academic assignment", async () => {
      const assignment = await AssignmentsService.createAssignment(testStudentId, {
        title: "Compiler Design Syntax Tree Generator in Python",
        subject: "Compiler Design",
        description: "Implement recursive descent parser producing AST for simple arithmetic expressions.",
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        priority: "HIGH",
        status: "PENDING",
      });

      expect(assignment.id).toBeDefined();
      expect(assignment.userId).toBe(testStudentId);
      expect(assignment.title).toContain("Compiler Design");
      expect(assignment.status).toBe("PENDING");
      expect(assignment.dueDays).toBeGreaterThan(0);

      createdAssignmentId = assignment.id;
    });

    it("Step 2: Should retrieve assignments with status and subject filters", async () => {
      const all = await AssignmentsService.getAssignments(testStudentId);
      expect(all.some((a) => a.id === createdAssignmentId)).toBe(true);

      const subjectFiltered = await AssignmentsService.getAssignments(testStudentId, {
        subject: "Compiler Design",
      });
      expect(subjectFiltered.length).toBeGreaterThan(0);
      expect(subjectFiltered[0].subject).toBe("Compiler Design");

      const queryFiltered = await AssignmentsService.getAssignments(testStudentId, {
        query: "Syntax Tree",
      });
      expect(queryFiltered.length).toBeGreaterThan(0);
      expect(queryFiltered[0].id).toBe(createdAssignmentId);
    });

    it("Step 3: Should update assignment status to IN_PROGRESS and then COMPLETED", async () => {
      const inProgress = await AssignmentsService.updateAssignment(
        createdAssignmentId,
        testStudentId,
        { status: "IN_PROGRESS" }
      );
      expect(inProgress.status).toBe("IN_PROGRESS");

      const completed = await AssignmentsService.updateAssignment(
        createdAssignmentId,
        testStudentId,
        { status: "COMPLETED" }
      );
      expect(completed.status).toBe("COMPLETED");
    });

    it("Step 4: Should compute accurate completion rate and assignment statistics", async () => {
      const stats = await AssignmentsService.getAssignmentsStats(testStudentId);
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.completed).toBeGreaterThan(0);
      expect(stats.completionRate).toBeGreaterThanOrEqual(0);
      expect(stats.completionRate).toBeLessThanOrEqual(100);
    });

    it("Step 5: Should delete assignment cleanly", async () => {
      const deleted = await AssignmentsService.deleteAssignment(createdAssignmentId, testStudentId);
      expect(deleted).toBe(true);

      const after = await AssignmentsService.getAssignments(testStudentId);
      expect(after.some((a) => a.id === createdAssignmentId)).toBe(false);
    });
  });

  describe("Timetable Schedule CRUD & Live Status Tracking", () => {
    it("Step 6: Should create a non-clashing class entry", async () => {
      const classEntry = await TimetableService.createEntry(testStudentId, {
        subject: "Cloud Computing & Kubernetes",
        faculty: "Dr. Sandeep",
        day: "Thursday",
        startTime: "16:00",
        endTime: "17:15",
        room: "LH-402",
        notes: "Container orchestration & microservices architecture",
      });

      expect(classEntry.id).toBeDefined();
      expect(classEntry.subject).toBe("Cloud Computing & Kubernetes");
      expect(classEntry.day).toBe("Thursday");

      createdClassId = classEntry.id;
    });

    it("Step 7: Should detect clash when adding an overlapping class on the same day", async () => {
      const clash = await TimetableService.checkTimeClash(
        testStudentId,
        "Thursday",
        "16:30", // overlaps 16:00 - 17:15
        "17:30"
      );

      expect(clash.hasClash).toBe(true);
      expect(clash.conflictingClass).toBeDefined();
      expect(clash.conflictingClass?.id).toBe(createdClassId);
    });

    it("Step 8: Should query today's classes with calculated status (UPCOMING / IN_PROGRESS / COMPLETED)", async () => {
      const todayClasses = await TimetableService.getTodayClasses(testStudentId, "Thursday");
      expect(todayClasses.length).toBeGreaterThan(0);

      const target = todayClasses.find((c) => c.id === createdClassId);
      expect(target).toBeDefined();
      expect(["UPCOMING", "IN_PROGRESS", "COMPLETED"]).toContain(target?.status);
    });

    it("Step 9: Should delete timetable class cleanly", async () => {
      const deleted = await TimetableService.deleteEntry(createdClassId, testStudentId);
      expect(deleted).toBe(true);

      const weekly = await TimetableService.getWeeklyTimetable(testStudentId);
      expect(weekly.some((c) => c.id === createdClassId)).toBe(false);
    });
  });
});
