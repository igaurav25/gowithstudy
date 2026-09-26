import { UnifiedCitation } from "@/services/search/types";

export type TutorDifficulty =
  | "BEGINNER"
  | "COLLEGE_BTECH"
  | "EXAM_LEVEL"
  | "INTERVIEW_LEVEL"
  | "ADVANCED";

export type TeachingLanguage = "en" | "hi" | "hinglish" | "es" | "auto";

export interface LessonStep {
  stepNumber: number;
  title: string;
  phase: "DEFINITION" | "INTUITION" | "ANALOGY" | "MECHANICS" | "CODE_APPLICATION" | "EXAM_NOTE";
  content: string;
  spokenScript: string;
  pageCitation?: { title: string; pageNumber: number };
}

export interface TutorCheckQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  misconceptionRemedy: Record<number, string>; // Explains specifically why the chosen wrong answer was picked and clarifies
}

export interface CourseLesson {
  id: string;
  unitId: string;
  lessonNumber: number;
  title: string;
  conceptSummary: string;
  pageReference?: number;
  keyFormulasOrTerms: string[];
  steps: LessonStep[];
  checkQuestion: TutorCheckQuestion;
}

export interface CourseUnit {
  id: string;
  unitNumber: number;
  title: string;
  overview: string;
  topics: string[];
  sourcePages?: number[];
  lessons: CourseLesson[];
}

export interface TutorCourse {
  id: string;
  userId: string;
  sourceNoteId?: string;
  title: string;
  subject: string;
  targetLevel: TutorDifficulty;
  preferredLanguage: TeachingLanguage;
  totalLessons: number;
  units: CourseUnit[];
  createdAt: string;
  updatedAt: string;
}

export interface WeakTopicItem {
  topic: string;
  reason: string;
  failedAttempts: number;
  lessonId: string;
}

export interface StudentTutorProgress {
  courseId: string;
  userId: string;
  currentUnitId: string;
  currentLessonId: string;
  currentStepIndex: number;
  completedLessonIds: string[];
  weakTopics: WeakTopicItem[];
  quizScores: {
    lessonId: string;
    correct: boolean;
    studentAnswer: number;
    timestamp: string;
  }[];
  pausedLessonState?: {
    interruptedAtStep: number;
    lessonId: string;
    lessonTitle: string;
    interruptionQuery?: string;
  };
}

export interface TutorInteractionResponse {
  mode:
    | "TEACHING_STEP"
    | "CHECK_QUESTION"
    | "EVALUATION"
    | "INTERRUPTION_ANSWER"
    | "COURSE_COMPLETED";
  teachingTextMarkdown: string;
  spokenText: string;
  currentLesson?: CourseLesson;
  currentStepIndex: number;
  totalStepsInLesson: number;
  checkQuestion?: TutorCheckQuestion;
  evaluationResult?: {
    isCorrect: boolean;
    feedback: string;
    correctedConcept?: string;
    canProceed: boolean;
  };
  researchCitations?: UnifiedCitation[];
  usedWebSearch?: boolean;
  resumePrompt?: string;
  detectedLanguage: string;
  progress: {
    completedLessonsCount: number;
    totalLessonsCount: number;
    percentComplete: number;
  };
}
