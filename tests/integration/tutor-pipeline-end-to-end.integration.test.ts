import { describe, it, expect } from "vitest";
import { NotesService } from "@/services/notes-service";
import { CoursePipeline } from "@/services/tutor/course-pipeline";
import { TutorService } from "@/services/tutor/tutor-service";

describe("Integration: End-to-End PDF to AI Tutor Teaching & Research Flow", () => {
  const studentId = "usr_e2e_student_tutor";
  let createdNoteId = "";
  let activeCourseId = "";

  it("Step 1: Student uploads/creates PDF study material with course syllabus", async () => {
    const note = await NotesService.createNote(studentId, {
      title: "Computer Networks — TCP/IP, Congestion Control & Sockets",
      description: "Complete course syllabus covering TCP three-way handshake, congestion windows, sliding window protocol, and UDP streaming.",
      subject: "Computer Networks",
      category: "Syllabus & Lecture Notes",
      tags: ["Networks", "TCP", "UDP", "Congestion-Control", "Socket-Programming"],
      fileUrl: "/uploads/notes/computer_networks_cs302.pdf",
      fileName: "computer_networks_cs302.pdf",
      fileSize: 4200000,
      status: "IN_PROGRESS",
    });

    expect(note.id).toBeDefined();
    expect(note.title).toContain("Computer Networks");
    createdNoteId = note.id;
  });

  it("Step 2: PDF-to-Course pipeline extracts units, topics, and preserved page references", async () => {
    const course = await CoursePipeline.generateCourseFromNote(studentId, createdNoteId, {
      targetLevel: "COLLEGE_BTECH",
      preferredLanguage: "auto",
    });

    expect(course.id).toBeDefined();
    expect(course.units.length).toBeGreaterThan(0);
    expect(course.totalLessons).toBeGreaterThan(0);

    const firstLesson = course.units[0].lessons[0];
    expect(firstLesson.pageReference).toBeDefined();
    expect(firstLesson.steps.length).toBeGreaterThan(0);
    expect(firstLesson.checkQuestion.options.length).toBe(4);

    activeCourseId = course.id;
  });

  it("Step 3: Student launches interactive AI Tutor session and begins Lesson 1", async () => {
    const session = await TutorService.startOrResumeCourse(
      studentId,
      activeCourseId,
      createdNoteId
    );

    expect(session.course.id).toBe(activeCourseId);
    expect(session.progress.currentStepIndex).toBe(0);
    expect(session.interaction.mode).toBe("TEACHING_STEP");
    expect(session.interaction.spokenText).toBeDefined();
  });

  it("Step 4: Student advances to next step in the lesson", async () => {
    const step2 = await TutorService.nextStep(studentId, activeCourseId);
    expect(step2.currentStepIndex).toBe(1);
    expect(step2.mode).toBe("TEACHING_STEP");
    expect(step2.teachingTextMarkdown).toBeDefined();
  });

  it("Step 5: Student interrupts lesson with a live web research question in Hinglish", async () => {
    const interruptResult = await TutorService.handleInterruption(
      studentId,
      activeCourseId,
      "TCP handshake kya hota hai aur real-world me kaise use hota hai?"
    );

    expect(interruptResult.mode).toBe("INTERRUPTION_ANSWER");
    expect(interruptResult.detectedLanguage).toBe("hinglish");
    expect(interruptResult.teachingTextMarkdown).toBeDefined();
    expect(interruptResult.researchCitations?.length).toBeGreaterThan(0);
    expect(interruptResult.resumePrompt).toBeDefined();
  });

  it("Step 6: Student smoothly resumes lesson from paused state without losing context", async () => {
    const resumed = await TutorService.resumeLesson(studentId, activeCourseId);
    expect(resumed.mode).toBe("TEACHING_STEP");
    expect(resumed.currentStepIndex).toBe(1); // resumed at step 1
  });

  it("Step 7: Student answers the check-for-understanding question and completes lesson", async () => {
    // Advance to quiz question
    const qStep = await TutorService.nextStep(studentId, activeCourseId);
    expect(qStep.mode).toBe("CHECK_QUESTION");
    expect(qStep.checkQuestion).toBeDefined();

    const correctIdx = qStep.checkQuestion!.correctIndex;
    const evalResult = await TutorService.evaluateAnswer(studentId, activeCourseId, correctIdx);

    expect(evalResult.mode).toBe("EVALUATION");
    expect(evalResult.evaluationResult?.isCorrect).toBe(true);
    expect(evalResult.evaluationResult?.canProceed).toBe(true);

    // Verify progress updated
    const { progress } = await TutorService.startOrResumeCourse(studentId, activeCourseId);
    expect(progress.completedLessonIds.length).toBeGreaterThan(0);
  });
});
