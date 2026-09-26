import { describe, it, expect } from "vitest";
import { CoursePipeline } from "@/services/tutor/course-pipeline";
import { TutorService } from "@/services/tutor/tutor-service";

describe("Phase 2: Interactive Multilingual AI Tutor", () => {
  const userId = "test_student_user_123";

  describe("CoursePipeline: PDF / Note to Course Outline", () => {
    it("should build structured course with page references preserved", async () => {
      const course = await CoursePipeline.generateCourseFromNote(userId, "note_os_01");

      expect(course.id).toBeDefined();
      expect(course.title).toContain("Operating Systems");
      expect(course.units.length).toBeGreaterThan(0);

      const firstUnit = course.units[0];
      expect(firstUnit.lessons.length).toBeGreaterThan(0);

      const firstLesson = firstUnit.lessons[0];
      expect(firstLesson.pageReference).toBeDefined();
      expect(firstLesson.steps.length).toBeGreaterThan(0);
      expect(firstLesson.checkQuestion).toBeDefined();
      expect(firstLesson.checkQuestion.misconceptionRemedy).toBeDefined();
    });

    it("should generate DBMS master course with normal forms hierarchy", async () => {
      const course = await CoursePipeline.generateCourseFromNote(userId, "note_dbms_02");
      expect(course.title).toContain("DBMS");
      const unit = course.units[0];
      expect(unit.title).toContain("Normalization");
      expect(unit.lessons[0].title).toContain("BCNF");
    });
  });

  describe("TutorService: Interactive Teaching & Step Progression", () => {
    it("should initialize or resume course and return initial teaching step", async () => {
      const { course, progress, interaction } = await TutorService.startOrResumeCourse(
        userId,
        undefined,
        "note_os_01"
      );

      expect(course).toBeDefined();
      expect(progress.userId).toBe(userId);
      expect(progress.currentStepIndex).toBe(0);
      expect(interaction.mode).toBe("TEACHING_STEP");
      expect(interaction.teachingTextMarkdown).toContain("CPU Scheduling");
      expect(interaction.spokenText).toBeDefined();
    });

    it("should advance lesson step from definition to intuition", async () => {
      const { course } = await TutorService.startOrResumeCourse(userId, undefined, "note_os_01");
      const nextInteraction = await TutorService.nextStep(userId, course.id);

      expect(nextInteraction.currentStepIndex).toBe(1);
      expect(nextInteraction.mode).toBe("TEACHING_STEP");
      expect(nextInteraction.teachingTextMarkdown).toContain("supermarket checkout");
    });
  });

  describe("Check-for-Understanding & Misconception Remedying", () => {
    it("should evaluate wrong answer, flag weak topic, and return misconception remedy", async () => {
      const { course } = await TutorService.startOrResumeCourse(userId, undefined, "note_os_01");

      // Wrong answer selection (index 0)
      const evalResult = await TutorService.evaluateAnswer(userId, course.id, 0);

      expect(evalResult.mode).toBe("EVALUATION");
      expect(evalResult.evaluationResult?.isCorrect).toBe(false);
      expect(evalResult.evaluationResult?.canProceed).toBe(false);
      expect(evalResult.teachingTextMarkdown).toContain("Helpful Correction");

      // Verify that progress now lists this weak topic
      const { progress } = await TutorService.startOrResumeCourse(userId, course.id);
      expect(progress.weakTopics.length).toBeGreaterThan(0);
      expect(progress.weakTopics[0].failedAttempts).toBeGreaterThanOrEqual(1);
    });

    it("should evaluate correct answer, mark lesson completed, and advance", async () => {
      const { course } = await TutorService.startOrResumeCourse(userId, undefined, "note_os_01");

      // Correct answer is index 1 for cq_os_1
      const evalResult = await TutorService.evaluateAnswer(userId, course.id, 1);

      expect(evalResult.mode).toBe("EVALUATION");
      expect(evalResult.evaluationResult?.isCorrect).toBe(true);
      expect(evalResult.evaluationResult?.canProceed).toBe(true);
      expect(evalResult.teachingTextMarkdown).toContain("Excellent Job");

      // Verify lesson marked complete
      const { progress } = await TutorService.startOrResumeCourse(userId, course.id);
      expect(progress.completedLessonIds.length).toBeGreaterThan(0);
    });
  });

  describe("Tutor Dynamic Interruption & Resume Behavior", () => {
    it("should answer student interruption in Hinglish with cited evidence and offer resumption", async () => {
      const { course } = await TutorService.startOrResumeCourse(userId, undefined, "note_os_01");

      const interruptionResponse = await TutorService.handleInterruption(
        userId,
        course.id,
        "deadlock kya hota hai aur banker algorithm kaise use karte hain?"
      );

      expect(interruptionResponse.mode).toBe("INTERRUPTION_ANSWER");
      expect(interruptionResponse.detectedLanguage).toBe("hinglish");
      expect(interruptionResponse.teachingTextMarkdown.toLowerCase()).toContain("deadlock");
      expect(interruptionResponse.resumePrompt).toBeDefined();
      expect(interruptionResponse.researchCitations?.length).toBeGreaterThan(0);

      // Resume lesson after interruption
      const resumed = await TutorService.resumeLesson(userId, course.id);
      expect(resumed.mode).toBe("TEACHING_STEP");
    });
  });
});
