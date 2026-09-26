"use client";

import * as React from "react";
import {
  TutorCourse,
  StudentTutorProgress,
  TutorInteractionResponse,
  TutorDifficulty,
  TeachingLanguage,
} from "@/services/tutor/types";
import {
  startTutorCourseAction,
  nextTutorStepAction,
  evaluateTutorAnswerAction,
  askTutorQuestionAction,
  resumeTutorLessonAction,
} from "@/features/tutor/actions";
import { TutorAvatar, AvatarState } from "@/components/tutor/tutor-avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Send,
  Globe,
  ChevronRight,
  Layers,
  Lightbulb,
} from "lucide-react";
import { NoteItem } from "@/services/notes-service";

interface TutorWorkspaceProps {
  initialCourse: TutorCourse;
  initialProgress: StudentTutorProgress;
  initialInteraction: TutorInteractionResponse;
  availableNotes: NoteItem[];
}

export function TutorWorkspace({
  initialCourse,
  initialProgress,
  initialInteraction,
  availableNotes,
}: TutorWorkspaceProps) {
  const [course, setCourse] = React.useState<TutorCourse>(initialCourse);
  const [progress, setProgress] = React.useState<StudentTutorProgress>(initialProgress);
  const [interaction, setInteraction] = React.useState<TutorInteractionResponse>(initialInteraction);

  const [isLoading, setIsLoading] = React.useState(false);
  const [interruptionInput, setInterruptionInput] = React.useState("");
  const [selectedAnswerIndex, setSelectedAnswerIndex] = React.useState<number | null>(null);
  const [selectedNoteId, setSelectedNoteId] = React.useState<string>(initialCourse.sourceNoteId || "note_os_01");
  const [difficulty, setDifficulty] = React.useState<TutorDifficulty>(initialCourse.targetLevel);
  const [language, setLanguage] = React.useState<TeachingLanguage>(initialCourse.preferredLanguage);

  // Derive avatar state
  let avatarState: AvatarState = "IDLE";
  if (isLoading) avatarState = "THINKING";
  else if (interaction.mode === "CHECK_QUESTION") avatarState = "QUESTIONING";
  else if (interaction.evaluationResult?.isCorrect) avatarState = "CELEBRATING";

  // Handle Lesson Advance
  const handleNextStep = async () => {
    setIsLoading(true);
    setSelectedAnswerIndex(null);
    try {
      const res = await nextTutorStepAction(course.id);
      if (res.success && res.data) {
        setInteraction(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Check Question Answer Submission
  const handleAnswerSubmit = async (answerIdx: number) => {
    setSelectedAnswerIndex(answerIdx);
    setIsLoading(true);
    try {
      const res = await evaluateTutorAnswerAction(course.id, answerIdx);
      if (res.success && res.data) {
        setInteraction(res.data);
        if (res.data.evaluationResult?.isCorrect) {
          setProgress((prev) => ({
            ...prev,
            completedLessonIds: Array.from(new Set([...prev.completedLessonIds, prev.currentLessonId])),
          }));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Question Interruption
  const handleInterruption = async (queryText?: string) => {
    const q = (queryText || interruptionInput).trim();
    if (!q || isLoading) return;

    setIsLoading(true);
    setInterruptionInput("");
    try {
      const res = await askTutorQuestionAction(course.id, q);
      if (res.success && res.data) {
        setInteraction(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Resume Lesson after Interruption
  const handleResume = async () => {
    setIsLoading(true);
    try {
      const res = await resumeTutorLessonAction(course.id);
      if (res.success && res.data) {
        setInteraction(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Course Switching
  const handleCourseSwitch = async (noteId: string) => {
    setIsLoading(true);
    setSelectedNoteId(noteId);
    try {
      const res = await startTutorCourseAction({
        noteId,
        targetLevel: difficulty,
        preferredLanguage: language,
      });
      if (res.success && res.data) {
        setCourse(res.data.course);
        setProgress(res.data.progress);
        setInteraction(res.data.interaction);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const currentLesson = interaction.currentLesson || course.units[0]?.lessons[0];

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT COLUMN: Course Outline & Progress Tracker (4 cols) */}
      <div className="lg:col-span-4 space-y-4">
        {/* Course Card & Selector */}
        <Card className="p-4 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Interactive AI Course
            </span>
            <Badge variant="purple" className="text-[10px]">
              {difficulty.replace("_", " ")}
            </Badge>
          </div>

          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
            {course.title}
          </h2>

          {/* Switch Document / Subject */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              Select Study Material / Note:
            </label>
            <select
              value={selectedNoteId}
              onChange={(e) => handleCourseSwitch(e.target.value)}
              className="w-full text-xs py-2 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
            >
              <option value="note_os_01">Operating Systems (Process, Sched & Deadlocks)</option>
              <option value="note_dbms_02">DBMS (Architecture, Normalization & BCNF)</option>
              {availableNotes
                .filter((n) => n.id !== "note_os_01" && n.id !== "note_dbms_02")
                .map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.title} ({n.subject})
                  </option>
                ))}
            </select>
          </div>

          {/* Overall Course Progress */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-600 dark:text-zinc-400">Mastery Progress</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {interaction.progress.percentComplete}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                style={{ width: `${interaction.progress.percentComplete}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Units & Lessons Sidebar */}
        <Card className="p-4 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>Course Syllabus & Lessons</span>
          </div>

          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {course.units.map((unit) => (
              <div key={unit.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  <span className="truncate">{unit.title}</span>
                  {unit.sourcePages && (
                    <span className="text-[10px] text-zinc-400">
                      p. {unit.sourcePages.join(", ")}
                    </span>
                  )}
                </div>

                <div className="space-y-1 pl-1">
                  {unit.lessons.map((lesson) => {
                    const isCurrent = lesson.id === progress.currentLessonId;
                    const isCompleted = progress.completedLessonIds.includes(lesson.id);

                    return (
                      <div
                        key={lesson.id}
                        className={`p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          isCurrent
                            ? "bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 font-semibold text-indigo-900 dark:text-indigo-200"
                            : isCompleted
                            ? "bg-zinc-50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300"
                            : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/20"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          ) : isCurrent ? (
                            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse flex-shrink-0" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700 flex-shrink-0" />
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </div>

                        {lesson.pageReference && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-500">
                            p.{lesson.pageReference}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Weak Topics / Areas Needing Revision */}
        {progress.weakTopics.length > 0 && (
          <Card className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/40 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              <span>Concepts to Strengthen ({progress.weakTopics.length})</span>
            </div>
            <div className="space-y-1.5 text-xs">
              {progress.weakTopics.map((item, idx) => (
                <div key={idx} className="p-2 rounded bg-white/80 dark:bg-zinc-900/80 border border-amber-200/60 space-y-0.5">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{item.topic}</span>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">{item.reason}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* RIGHT COLUMN: Interactive Teaching Stage & Classroom (8 cols) */}
      <div className="lg:col-span-8 space-y-4">
        {/* Top Controls: Language & Level Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {currentLesson?.title || "Lesson"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {/* Preferred Teaching Language */}
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-zinc-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as TeachingLanguage)}
                className="py-1 px-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs border-none"
              >
                <option value="auto">Auto Language</option>
                <option value="hinglish">Hinglish</option>
                <option value="hi">Hindi (हिंदी)</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
              </select>
            </div>

            {/* Difficulty Level */}
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as TutorDifficulty)}
              className="py-1 px-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs border-none font-medium"
            >
              <option value="COLLEGE_BTECH">B.Tech / College</option>
              <option value="EXAM_LEVEL">Exam & GATE</option>
              <option value="INTERVIEW_LEVEL">Interview Prep</option>
              <option value="BEGINNER">Beginner</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
        </div>

        {/* AI Teacher Character Avatar Stage */}
        <TutorAvatar
          spokenText={interaction.spokenText}
          avatarState={avatarState}
          detectedLanguage={interaction.detectedLanguage}
          autoPlay={true}
        />

        {/* Resumption Banner after Interruption */}
        {interaction.mode === "INTERRUPTION_ANSWER" && (
          <Card className="p-4 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border-indigo-500/30 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                Lesson Paused at Current Step
              </span>
              <p className="text-xs text-indigo-700 dark:text-indigo-300">
                {interaction.resumePrompt}
              </p>
            </div>
            <Button
              onClick={handleResume}
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Resume Lesson</span>
            </Button>
          </Card>
        )}

        {/* Main Lesson Content Card */}
        <Card className="p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                Step {interaction.currentStepIndex + 1} of {Math.max(1, interaction.totalStepsInLesson)}
              </span>
              {currentLesson?.pageReference && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
                  📄 Course PDF Page {currentLesson.pageReference}
                </span>
              )}
              {interaction.usedWebSearch && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  Live Web Research Included
                </span>
              )}
            </div>

            {/* Step Progression Pills */}
            <div className="flex items-center gap-1">
              {Array.from({ length: interaction.totalStepsInLesson }).map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === interaction.currentStepIndex
                      ? "bg-indigo-600 scale-125"
                      : i < interaction.currentStepIndex
                      ? "bg-emerald-500"
                      : "bg-zinc-200 dark:bg-zinc-800"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Lesson Markdown Body */}
          <div className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-line">
            {interaction.teachingTextMarkdown}
          </div>

          {/* Citations Panel if interruption performed search */}
          {interaction.researchCitations && interaction.researchCitations.length > 0 && (
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Researched Evidence & Citations:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {interaction.researchCitations.map((c) => (
                  <div key={c.id} className="p-2 rounded bg-zinc-50 dark:bg-zinc-800/60 text-xs border border-zinc-200/60 dark:border-zinc-800 space-y-0.5">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate block">
                      {c.title}
                    </span>
                    <p className="text-[11px] text-zinc-500 italic line-clamp-2">&quot;{c.snippet}&quot;</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Check-for-Understanding Quiz Mode */}
          {interaction.mode === "CHECK_QUESTION" && interaction.checkQuestion && (
            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {interaction.checkQuestion.question}
              </h4>

              <div className="grid grid-cols-1 gap-2">
                {interaction.checkQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAnswerSubmit(idx)}
                    disabled={isLoading}
                    className={`text-left p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-start gap-2.5 ${
                      selectedAnswerIndex === idx
                        ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-sm"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-indigo-400 bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-800 dark:text-zinc-200"
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons Toolbar */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            {interaction.mode === "TEACHING_STEP" && (
              <Button
                onClick={handleNextStep}
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-5 py-2 font-medium text-xs sm:text-sm shadow flex items-center gap-1.5"
              >
                <span>Continue Lesson</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}

            {interaction.mode === "EVALUATION" && interaction.evaluationResult?.canProceed && (
              <Button
                onClick={handleNextStep}
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-5 py-2 font-medium text-xs sm:text-sm shadow flex items-center gap-1.5"
              >
                <span>Next Concept</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}

            {interaction.mode === "EVALUATION" && !interaction.evaluationResult?.canProceed && (
              <Button
                onClick={handleNextStep}
                disabled={isLoading}
                variant="outline"
                className="rounded-xl px-4 py-2 text-xs sm:text-sm border-amber-300 text-amber-700 dark:text-amber-300 hover:bg-amber-50"
              >
                <span>Try Again</span>
              </Button>
            )}
          </div>
        </Card>

        {/* Any-Question Interruption Box */}
        <Card className="p-4 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Interrupt Tutor with Any Question (English, Hindi, Hinglish):
            </span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleInterruption();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={interruptionInput}
              onChange={(e) => setInterruptionInput(e.target.value)}
              placeholder="e.g. 'deadlock kya hota hai?', 'give a real-life analogy', 'explain simply', 'show C code'..."
              disabled={isLoading}
              className="flex-1 py-2.5 px-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Button
              type="submit"
              disabled={isLoading || !interruptionInput.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2.5 h-auto text-xs font-semibold"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>

          {/* Quick chip triggers */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500 pt-1">
            <span className="font-semibold text-zinc-400">Quick prompts:</span>
            {[
              "Explain simply",
              "Give another example",
              "Show code implementation",
              "Explain in Hinglish",
              "Important for exams?",
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleInterruption(chip)}
                className="px-2.5 py-0.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-400 hover:text-indigo-600 text-zinc-600 dark:text-zinc-300 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
