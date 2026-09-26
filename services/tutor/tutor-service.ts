import {
  TutorCourse,
  CourseLesson,
  StudentTutorProgress,
  TutorInteractionResponse,
  TutorDifficulty,
  TeachingLanguage,
} from "@/services/tutor/types";
import { CoursePipeline } from "@/services/tutor/course-pipeline";
import { UniversalSearchService } from "@/services/search/search-service";
import { detectLanguage } from "@/services/search/query-router";

import { globalCourseStore as courseStore, globalProgressStore as progressStore } from "@/services/tutor/course-store";

export class TutorService {
  static registerCourse(course: TutorCourse): void {
    courseStore.set(course.id, course);
  }

  static getCourse(courseId: string): TutorCourse | undefined {
    return courseStore.get(courseId);
  }

  /**
   * Initializes or loads course and student progress
   */
  static async startOrResumeCourse(
    userId: string,
    courseId?: string,
    noteId = "note_os_01",
    options?: {
      targetLevel?: TutorDifficulty;
      preferredLanguage?: TeachingLanguage;
    }
  ): Promise<{ course: TutorCourse; progress: StudentTutorProgress; interaction: TutorInteractionResponse }> {
    let course: TutorCourse | undefined;

    if (courseId && courseStore.has(courseId)) {
      course = courseStore.get(courseId);
    }

    if (!course) {
      course = await CoursePipeline.generateCourseFromNote(userId, noteId, options);
      courseStore.set(course.id, course);
    }

    const progressKey = `${userId}_${course.id}`;
    let progress = progressStore.get(progressKey);

    if (!progress) {
      const firstUnit = course.units[0];
      const firstLesson = firstUnit.lessons[0];

      progress = {
        courseId: course.id,
        userId,
        currentUnitId: firstUnit.id,
        currentLessonId: firstLesson.id,
        currentStepIndex: 0,
        completedLessonIds: [],
        weakTopics: [],
        quizScores: [],
      };
      progressStore.set(progressKey, progress);
    }

    const interaction = this.buildInteractionForCurrentStep(course, progress);
    return { course, progress, interaction };
  }

  /**
   * Advances student to the next step or check question within active lesson
   */
  static async nextStep(
    userId: string,
    courseId: string
  ): Promise<TutorInteractionResponse> {
    const course = courseStore.get(courseId);
    const progressKey = `${userId}_${courseId}`;
    const progress = progressStore.get(progressKey);

    if (!course || !progress) {
      throw new Error("Active course session not found.");
    }

    const currentLesson = this.findLesson(course, progress.currentLessonId);
    if (!currentLesson) {
      throw new Error("Current lesson not found.");
    }

    const nextStepIdx = progress.currentStepIndex + 1;

    // If there are more steps in current lesson
    if (nextStepIdx < currentLesson.steps.length) {
      progress.currentStepIndex = nextStepIdx;
      progressStore.set(progressKey, progress);
      return this.buildInteractionForCurrentStep(course, progress);
    }

    // Otherwise, transition to Check-for-Understanding Quiz Question
    const percent = Math.round(
      (progress.completedLessonIds.length / Math.max(1, course.totalLessons)) * 100
    );

    return {
      mode: "CHECK_QUESTION",
      teachingTextMarkdown: `### 🎯 Quick Concept Check: ${currentLesson.title}\nBefore we conclude this lesson, let's test your understanding with this short question:`,
      spokenText: `Before we wrap up this concept, let's verify your understanding with a quick question. Choose the best answer below.`,
      currentLesson,
      currentStepIndex: currentLesson.steps.length,
      totalStepsInLesson: currentLesson.steps.length,
      checkQuestion: currentLesson.checkQuestion,
      detectedLanguage: course.preferredLanguage || "en",
      progress: {
        completedLessonsCount: progress.completedLessonIds.length,
        totalLessonsCount: course.totalLessons,
        percentComplete: percent,
      },
    };
  }

  /**
   * Evaluates student's answer to the check-for-understanding question
   */
  static async evaluateAnswer(
    userId: string,
    courseId: string,
    studentAnswerIndex: number
  ): Promise<TutorInteractionResponse> {
    const course = courseStore.get(courseId);
    const progressKey = `${userId}_${courseId}`;
    const progress = progressStore.get(progressKey);

    if (!course || !progress) {
      throw new Error("Active course session not found.");
    }

    const currentLesson = this.findLesson(course, progress.currentLessonId);
    if (!currentLesson) {
      throw new Error("Current lesson not found.");
    }

    const checkQ = currentLesson.checkQuestion;
    const isCorrect = studentAnswerIndex === checkQ.correctIndex;

    // Record quiz attempt
    progress.quizScores.push({
      lessonId: currentLesson.id,
      correct: isCorrect,
      studentAnswer: studentAnswerIndex,
      timestamp: new Date().toISOString(),
    });

    if (isCorrect) {
      // Mark lesson as complete if not already marked
      if (!progress.completedLessonIds.includes(currentLesson.id)) {
        progress.completedLessonIds.push(currentLesson.id);
      }

      // Remove from weak topics if previously flagged
      progress.weakTopics = progress.weakTopics.filter((w) => w.lessonId !== currentLesson.id);

      // Find next lesson
      const nextLesson = this.findNextLesson(course, currentLesson.id);

      if (nextLesson) {
        progress.currentLessonId = nextLesson.id;
        progress.currentUnitId = nextLesson.unitId;
        progress.currentStepIndex = 0;
      }

      progressStore.set(progressKey, progress);

      const percent = Math.round(
        (progress.completedLessonIds.length / Math.max(1, course.totalLessons)) * 100
      );

      return {
        mode: "EVALUATION",
        teachingTextMarkdown: `### 🎉 Excellent Job!\n**Correct Answer:** Option ${studentAnswerIndex + 1} — "${checkQ.options[studentAnswerIndex]}".\n\n${checkQ.explanation}\n\n${
          nextLesson
            ? `> 🚀 **Ready for Next Lesson:** "${nextLesson.title}". Click **Continue Lesson** to proceed.`
            : "> 🏆 **Congratulations!** You have completed all lessons in this course!"
        }`,
        spokenText: `Excellent job! That is completely correct. ${checkQ.explanation}. You have mastered this concept. Let's move on to the next topic!`,
        currentLesson,
        currentStepIndex: currentLesson.steps.length,
        totalStepsInLesson: currentLesson.steps.length,
        checkQuestion: checkQ,
        evaluationResult: {
          isCorrect: true,
          feedback: "Spot on! Your conceptual reasoning matches the core principles.",
          canProceed: true,
        },
        detectedLanguage: course.preferredLanguage || "en",
        progress: {
          completedLessonsCount: progress.completedLessonIds.length,
          totalLessonsCount: course.totalLessons,
          percentComplete: percent,
        },
      };
    } else {
      // Handle Incorrect Answer: Provide remedy & mark as weak topic
      const remedy = checkQ.misconceptionRemedy[studentAnswerIndex] || "Review the core definition and retry.";

      const existingWeak = progress.weakTopics.find((w) => w.lessonId === currentLesson.id);
      if (existingWeak) {
        existingWeak.failedAttempts += 1;
      } else {
        progress.weakTopics.push({
          topic: currentLesson.title,
          reason: remedy,
          failedAttempts: 1,
          lessonId: currentLesson.id,
        });
      }

      progressStore.set(progressKey, progress);

      const percent = Math.round(
        (progress.completedLessonIds.length / Math.max(1, course.totalLessons)) * 100
      );

      return {
        mode: "EVALUATION",
        teachingTextMarkdown: `### 💡 Helpful Correction & Misconception Review\n**Option ${studentAnswerIndex + 1} is not quite right.**\n\n* **Why:** ${remedy}\n\n* **Correct Logic:** ${checkQ.explanation}\n\n> 🔄 **Tutor Tip:** Don't worry! Making mistakes is part of learning. Click **Try Again** or **Re-explain Concept** to strengthen your intuition.`,
        spokenText: `Option ${studentAnswerIndex + 1} is not quite right. Here is why: ${remedy}. Take another look at the question and try again!`,
        currentLesson,
        currentStepIndex: currentLesson.steps.length,
        totalStepsInLesson: currentLesson.steps.length,
        checkQuestion: checkQ,
        evaluationResult: {
          isCorrect: false,
          feedback: remedy,
          correctedConcept: checkQ.explanation,
          canProceed: false,
        },
        detectedLanguage: course.preferredLanguage || "en",
        progress: {
          completedLessonsCount: progress.completedLessonIds.length,
          totalLessonsCount: course.totalLessons,
          percentComplete: percent,
        },
      };
    }
  }

  /**
   * Handles student interruption: student can ask ANY question in any language!
   * Combines course notes + Live Web Research from Phase 1 if broader knowledge is needed.
   */
  static async handleInterruption(
    userId: string,
    courseId: string,
    studentQuestion: string
  ): Promise<TutorInteractionResponse> {
    const course = courseStore.get(courseId);
    const progressKey = `${userId}_${courseId}`;
    const progress = progressStore.get(progressKey);

    if (!course || !progress) {
      throw new Error("Active course session not found.");
    }

    const currentLesson = this.findLesson(course, progress.currentLessonId);
    const lessonTitle = currentLesson?.title || "Lesson";

    // Remember the interrupted state to smoothly resume
    progress.pausedLessonState = {
      interruptedAtStep: progress.currentStepIndex,
      lessonId: progress.currentLessonId,
      lessonTitle,
      interruptionQuery: studentQuestion,
    };
    progressStore.set(progressKey, progress);

    // Detect language of question
    const lang = detectLanguage(studentQuestion);

    // Call Phase 1 Universal AI Search for grounded multi-source answer
    const searchResponse = await UniversalSearchService.search(studentQuestion, {
      userId,
      targetNoteId: course.sourceNoteId || "ALL",
      history: [
        {
          role: "user",
          content: `We are currently in the lesson "${lessonTitle}" in the course "${course.title}".`,
        },
      ],
    });

    const isHinglish = lang === "hinglish";
    const resumePrompt = isHinglish
      ? `Kya ab aapka doubt clear ho gaya? Chaliye wapas chalte hain "**${lessonTitle}**" par!`
      : `Now that we've addressed your question, ready to resume our lesson on **"${lessonTitle}"**?`;

    // Format final spoken text for avatar
    const spokenText = isHinglish
      ? `Aapka question tha: ${studentQuestion}. ${searchResponse.answerMarkdown.replace(/#|\*|_|\[\d+\]/g, "").slice(0, 200)}. Chaliye lesson continue karte hain.`
      : `Great question. ${searchResponse.answerMarkdown.replace(/#|\*|_|\[\d+\]/g, "").slice(0, 220)}. Let's continue with our lesson when you're ready.`;

    const percent = Math.round(
      (progress.completedLessonIds.length / Math.max(1, course.totalLessons)) * 100
    );

    return {
      mode: "INTERRUPTION_ANSWER",
      teachingTextMarkdown: `### 💬 Tutor Answer & Research\n**Your Question:** *"${studentQuestion}"*\n\n${searchResponse.answerMarkdown}\n\n---\n\n> 🎓 **Resume Lesson:** ${resumePrompt}`,
      spokenText,
      currentLesson,
      currentStepIndex: progress.currentStepIndex,
      totalStepsInLesson: currentLesson?.steps.length || 1,
      researchCitations: searchResponse.citations,
      usedWebSearch: searchResponse.searchPerformed,
      resumePrompt,
      detectedLanguage: lang,
      progress: {
        completedLessonsCount: progress.completedLessonIds.length,
        totalLessonsCount: course.totalLessons,
        percentComplete: percent,
      },
    };
  }

  /**
   * Resumes the paused lesson after an interruption
   */
  static async resumeLesson(
    userId: string,
    courseId: string
  ): Promise<TutorInteractionResponse> {
    const course = courseStore.get(courseId);
    const progressKey = `${userId}_${courseId}`;
    const progress = progressStore.get(progressKey);

    if (!course || !progress) {
      throw new Error("Active course session not found.");
    }

    if (progress.pausedLessonState) {
      progress.currentLessonId = progress.pausedLessonState.lessonId;
      progress.currentStepIndex = progress.pausedLessonState.interruptedAtStep;
      progress.pausedLessonState = undefined;
      progressStore.set(progressKey, progress);
    }

    return this.buildInteractionForCurrentStep(course, progress);
  }

  /**
   * Helper to build structured interaction response for current step
   */
  private static buildInteractionForCurrentStep(
    course: TutorCourse,
    progress: StudentTutorProgress
  ): TutorInteractionResponse {
    const currentLesson = this.findLesson(course, progress.currentLessonId);

    if (!currentLesson) {
      return {
        mode: "COURSE_COMPLETED",
        teachingTextMarkdown: "### 🏆 Course Completed!\nYou have finished all the lessons in this master curriculum.",
        spokenText: "Congratulations! You have completed all lessons in this course. Excellent work!",
        currentStepIndex: 0,
        totalStepsInLesson: 0,
        detectedLanguage: course.preferredLanguage || "en",
        progress: {
          completedLessonsCount: progress.completedLessonIds.length,
          totalLessonsCount: course.totalLessons,
          percentComplete: 100,
        },
      };
    }

    const step = currentLesson.steps[progress.currentStepIndex] || currentLesson.steps[0];
    const percent = Math.round(
      (progress.completedLessonIds.length / Math.max(1, course.totalLessons)) * 100
    );

    return {
      mode: "TEACHING_STEP",
      teachingTextMarkdown: `${step.content}${
        step.pageCitation
          ? `\n\n> 📄 *Source: ${step.pageCitation.title}, Page ${step.pageCitation.pageNumber}*`
          : ""
      }`,
      spokenText: step.spokenScript,
      currentLesson,
      currentStepIndex: progress.currentStepIndex,
      totalStepsInLesson: currentLesson.steps.length,
      detectedLanguage: course.preferredLanguage || "en",
      progress: {
        completedLessonsCount: progress.completedLessonIds.length,
        totalLessonsCount: course.totalLessons,
        percentComplete: percent,
      },
    };
  }

  private static findLesson(course: TutorCourse, lessonId: string): CourseLesson | undefined {
    for (const unit of course.units) {
      const match = unit.lessons.find((l) => l.id === lessonId);
      if (match) return match;
    }
    return course.units[0]?.lessons[0];
  }

  private static findNextLesson(course: TutorCourse, currentLessonId: string): CourseLesson | null {
    let foundCurrent = false;
    for (const unit of course.units) {
      for (const lesson of unit.lessons) {
        if (foundCurrent) return lesson;
        if (lesson.id === currentLessonId) foundCurrent = true;
      }
    }
    return null;
  }
}
