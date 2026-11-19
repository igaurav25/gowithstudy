"use client";

import * as React from "react";
import {
  StudyDeck,
  FlashcardItem,
  QuizQuestion,
  FlashcardRating,
} from "@/schemas/flashcard";
import {
  reviewFlashcardAction,
  generateStudySetAction,
} from "@/features/flashcards/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Layers,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Award,
  Zap,
  X,
  Lightbulb,
} from "lucide-react";

interface FlashcardStudyViewProps {
  initialDecks: StudyDeck[];
}

export function FlashcardStudyView({ initialDecks }: FlashcardStudyViewProps) {
  const [decks, setDecks] = React.useState<StudyDeck[]>(initialDecks);
  const [activeDeckId, setActiveDeckId] = React.useState<string>(
    initialDecks[0]?.id || ""
  );
  const [activeMode, setActiveMode] = React.useState<"FLASHCARDS" | "QUIZ">(
    "FLASHCARDS"
  );

  // Active Deck
  const activeDeck = React.useMemo(() => {
    return decks.find((d) => d.id === activeDeckId) || decks[0] || null;
  }, [decks, activeDeckId]);

  // Flashcards State
  const [currentCardIndex, setCurrentCardIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [isRating, setIsRating] = React.useState(false);

  // Quiz State
  const [currentQuizIndex, setCurrentQuizIndex] = React.useState(0);
  const [selectedAnswers, setSelectedAnswers] = React.useState<
    Record<number, number>
  >({});
  const [quizSubmitted, setQuizSubmitted] = React.useState(false);

  // Generate Modal State
  const [isGenModalOpen, setIsGenModalOpen] = React.useState(false);
  const [genSubject, setGenSubject] = React.useState("Operating Systems");
  const [genNoteTitle, setGenNoteTitle] = React.useState("");
  const [genNotesText, setGenNotesText] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [genError, setGenError] = React.useState<string | null>(null);

  const cards = activeDeck?.cards || [];
  const currentCard: FlashcardItem | undefined = cards[currentCardIndex];
  const quizzes: QuizQuestion[] = activeDeck?.quizzes || [];
  const currentQuiz: QuizQuestion | undefined = quizzes[currentQuizIndex];

  // Reset indices when deck changes
  const handleSelectDeck = (deckId: string) => {
    setActiveDeckId(deckId);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setCurrentQuizIndex(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
  };

  // Handle Card Flip
  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  // Handle Rating
  const handleRate = async (rating: FlashcardRating) => {
    if (!activeDeck || !currentCard || isRating) return;
    setIsRating(true);

    try {
      await reviewFlashcardAction(activeDeck.id, currentCard.id, rating);
    } catch (err) {
      console.error("Failed to save rating:", err);
    } finally {
      setIsRating(false);
      // Move to next card after brief delay
      if (currentCardIndex < cards.length - 1) {
        setIsFlipped(false);
        setTimeout(() => {
          setCurrentCardIndex((prev) => prev + 1);
        }, 150);
      }
    }
  };

  // Handle Next/Prev
  const handleNextCard = () => {
    if (currentCardIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentCardIndex((prev) => prev + 1);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setIsFlipped(false);
      setCurrentCardIndex((prev) => prev - 1);
    }
  };

  // Handle Quiz Selection
  const handleSelectOption = (optionIndex: number) => {
    if (selectedAnswers[currentQuizIndex] !== undefined) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuizIndex]: optionIndex,
    }));
  };

  // Calculate Quiz Score
  const quizScore = React.useMemo(() => {
    let score = 0;
    (activeDeck?.quizzes || []).forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score += 1;
      }
    });
    return score;
  }, [activeDeck, selectedAnswers]);

  // Handle Generate New Deck
  const handleGenerateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genNotesText.trim() || genNotesText.trim().length < 10) {
      setGenError("Please provide at least 10 characters of lecture content.");
      return;
    }

    setIsGenerating(true);
    setGenError(null);

    try {
      const res = await generateStudySetAction({
        subject: genSubject,
        noteTitle: genNoteTitle.trim() || undefined,
        notesText: genNotesText.trim(),
        cardCount: 5,
      });

      if (res.success && res.data) {
        setDecks((prev) => [res.data!, ...prev]);
        handleSelectDeck(res.data.id);
        setIsGenModalOpen(false);
        setGenNotesText("");
        setGenNoteTitle("");
      } else {
        setGenError(res.message || "Failed to generate deck.");
      }
    } catch {
      setGenError("Unexpected error occurred while generating deck.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-indigo-200/60 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/80 via-violet-50/40 to-sky-50/50 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-zinc-950 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-indigo-600 text-white">
              <Zap className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
              Active Recall & Spaced Repetition
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            AI Flashcards & Exam Quizzes
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Retain complex engineering formulas and university exam concepts in minutes. Flip flashcards or take quick mock quizzes.
          </p>
        </div>

        <Button
          onClick={() => setIsGenModalOpen(true)}
          variant="gradient"
          className="shrink-0 gap-2 min-h-[44px] touch-manipulation text-sm"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate from Notes</span>
        </Button>
      </section>

      {/* Deck Selector Chips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Select Study Deck:
          </span>
          <span className="text-xs text-zinc-500 font-medium">
            {decks.length} Decks Available
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-2 px-2">
          {decks.map((deck) => (
            <button
              key={deck.id}
              type="button"
              onClick={() => handleSelectDeck(deck.id)}
              className={cn(
                "px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all touch-manipulation min-h-[40px] flex items-center gap-2 border",
                activeDeckId === deck.id
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/25"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
              )}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>{deck.title}</span>
              <span className="text-[10px] opacity-75 font-mono">
                ({deck.cards.length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-center p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl max-w-sm mx-auto">
        <button
          type="button"
          onClick={() => setActiveMode("FLASHCARDS")}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-xl transition-all touch-manipulation min-h-[36px] flex items-center justify-center gap-1.5",
            activeMode === "FLASHCARDS"
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          )}
        >
          <Layers className="w-4 h-4" />
          <span>Flashcards ({cards.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMode("QUIZ")}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-xl transition-all touch-manipulation min-h-[36px] flex items-center justify-center gap-1.5",
            activeMode === "QUIZ"
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          )}
        >
          <Award className="w-4 h-4" />
          <span>Exam Quiz ({quizzes.length})</span>
        </button>
      </div>

      {/* MODE 1: FLASHCARDS */}
      {activeMode === "FLASHCARDS" && (
        <div className="space-y-4 max-w-2xl mx-auto">
          {cards.length === 0 ? (
            <Card className="p-8 text-center text-zinc-500 text-sm">
              No flashcards in this deck.
            </Card>
          ) : (
            <>
              {/* Progress Bar & Counter */}
              <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
                <span>
                  Card {currentCardIndex + 1} of {cards.length}
                </span>
                <Badge variant="purple" className="text-[10px]">
                  {currentCard?.topic}
                </Badge>
              </div>
              <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{
                    width: `${((currentCardIndex + 1) / cards.length) * 100}%`,
                  }}
                />
              </div>

              {/* The Flip Card Container */}
              <div
                onClick={handleFlip}
                className={cn(
                  "cursor-pointer select-none rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 min-h-[300px] sm:min-h-[340px] flex flex-col justify-between shadow-md hover:shadow-lg transition-all touch-manipulation relative overflow-hidden",
                  isFlipped
                    ? "ring-2 ring-indigo-500/30 bg-gradient-to-b from-white to-indigo-50/20 dark:from-zinc-900 dark:to-indigo-950/20"
                    : "hover:border-indigo-400/40"
                )}
              >
                {/* Top Bar inside Card */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                    {isFlipped ? "Answer & Analysis" : "Question / Prompt"}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Tap anywhere to flip
                  </span>
                </div>

                {/* Card Center Content */}
                <div className="py-6 space-y-4">
                  {!isFlipped ? (
                    <div className="space-y-3">
                      <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50 leading-relaxed">
                        {currentCard?.front}
                      </h3>
                      {currentCard?.mnemonic && (
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                          <span>{currentCard.mnemonic}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-sm sm:text-base leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-line font-medium">
                        {currentCard?.back}
                      </div>
                      {currentCard?.examinerTip && (
                        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 text-xs text-indigo-800 dark:text-indigo-300 flex items-start gap-2">
                          <HelpCircle className="w-4 h-4 shrink-0 text-indigo-600 mt-0.5" />
                          <span>
                            <strong>Examiner Tip:</strong>{" "}
                            {currentCard.examinerTip}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                  <span>Subject: {currentCard?.subject}</span>
                  <span className="font-mono text-[10px]">
                    Interval: {currentCard?.intervalDays}d
                  </span>
                </div>
              </div>

              {/* Spaced Repetition Rating Buttons */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 text-center block">
                  How well do you know this concept?
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleRate("AGAIN")}
                    disabled={isRating}
                    className="min-h-[46px] border-rose-200 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/60 dark:hover:bg-rose-950/40 text-xs flex flex-col gap-0.5 touch-manipulation"
                  >
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      Again
                    </span>
                    <span className="text-[10px] text-zinc-400">1 day</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleRate("GOOD")}
                    disabled={isRating}
                    className="min-h-[46px] border-amber-200 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-900/60 dark:hover:bg-amber-950/40 text-xs flex flex-col gap-0.5 touch-manipulation"
                  >
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      Good
                    </span>
                    <span className="text-[10px] text-zinc-400">3 days</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleRate("EASY")}
                    disabled={isRating}
                    className="min-h-[46px] border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-900/60 dark:hover:bg-emerald-950/40 text-xs flex flex-col gap-0.5 touch-manipulation"
                  >
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      Easy
                    </span>
                    <span className="text-[10px] text-zinc-400">6 days</span>
                  </Button>
                </div>
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevCard}
                  disabled={currentCardIndex === 0}
                  className="gap-1 text-xs min-h-[38px] touch-manipulation"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFlipped((prev) => !prev)}
                  className="gap-1 text-xs min-h-[38px] touch-manipulation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Flip Card</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextCard}
                  disabled={currentCardIndex === cards.length - 1}
                  className="gap-1 text-xs min-h-[38px] touch-manipulation"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* MODE 2: EXAM QUIZ */}
      {activeMode === "QUIZ" && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {quizzes.length === 0 ? (
            <Card className="p-8 text-center text-zinc-500 text-sm">
              No quiz questions available for this deck.
            </Card>
          ) : quizSubmitted ? (
            /* Quiz Score Card */
            <Card className="border-indigo-200/80 dark:border-indigo-900/80 p-6 sm:p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Award className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  Quiz Completed!
                </h3>
                <p className="text-sm text-zinc-500">
                  You scored {quizScore} out of {quizzes.length} (
                  {Math.round((quizScore / quizzes.length) * 100)}%)
                </p>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                {quizScore === quizzes.length
                  ? "🎯 Outstanding mastery! You answered all questions correctly."
                  : "💡 Solid attempt! Review the flashcards above to strengthen the concepts you missed."}
              </p>
              <Button
                variant="gradient"
                onClick={() => {
                  setSelectedAnswers({});
                  setCurrentQuizIndex(0);
                  setQuizSubmitted(false);
                }}
                className="min-h-[44px] touch-manipulation"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                <span>Retake Quiz</span>
              </Button>
            </Card>
          ) : (
            /* Quiz Question Card */
            <Card className="border-zinc-200/80 dark:border-zinc-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>
                    Question {currentQuizIndex + 1} of {quizzes.length}
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    {currentQuiz?.topic}
                  </Badge>
                </div>
                <CardTitle className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 pt-2 leading-relaxed">
                  {currentQuiz?.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 4 Options */}
                <div className="space-y-2">
                  {currentQuiz?.options.map((opt, oIdx) => {
                    const isSelected =
                      selectedAnswers[currentQuizIndex] === oIdx;
                    const hasAnswered =
                      selectedAnswers[currentQuizIndex] !== undefined;
                    const isCorrect = oIdx === currentQuiz.correctIndex;

                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleSelectOption(oIdx)}
                        disabled={hasAnswered}
                        className={cn(
                          "w-full p-3.5 rounded-2xl text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-3 border min-h-[48px] touch-manipulation",
                          !hasAnswered &&
                            "border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                          hasAnswered &&
                            isCorrect &&
                            "border-emerald-500 bg-emerald-50/80 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
                          hasAnswered &&
                            isSelected &&
                            !isCorrect &&
                            "border-rose-500 bg-rose-50/80 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200",
                          hasAnswered &&
                            !isSelected &&
                            !isCorrect &&
                            "border-zinc-200 dark:border-zinc-800 opacity-60"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {hasAnswered && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        {hasAnswered && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Card when answered */}
                {selectedAnswers[currentQuizIndex] !== undefined && (
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs space-y-1">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                      Explanation:
                    </span>
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {currentQuiz?.explanation}
                    </p>
                  </div>
                )}

                {/* Next / Submit Button */}
                <div className="flex items-center justify-end pt-2">
                  {selectedAnswers[currentQuizIndex] !== undefined && (
                    <Button
                      variant="gradient"
                      onClick={() => {
                        if (currentQuizIndex < quizzes.length - 1) {
                          setCurrentQuizIndex((prev) => prev + 1);
                        } else {
                          setQuizSubmitted(true);
                        }
                      }}
                      className="min-h-[40px] text-xs touch-manipulation"
                    >
                      <span>
                        {currentQuizIndex < quizzes.length - 1
                          ? "Next Question"
                          : "Finish & View Score"}
                      </span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* MODAL: Generate Study Set from Notes */}
      {isGenModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-indigo-600 text-white">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                  Generate Flashcards & Quiz from Notes
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGenModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateDeck} className="p-5 space-y-4">
              {genError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
                  {genError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Subject Name
                </label>
                <Input
                  value={genSubject}
                  onChange={(e) => setGenSubject(e.target.value)}
                  placeholder="e.g. Operating Systems, Computer Networks"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Topic / Deck Title (Optional)
                </label>
                <Input
                  value={genNoteTitle}
                  onChange={(e) => setGenNoteTitle(e.target.value)}
                  placeholder="e.g. Unit 3: Deadlocks & Banker's Algorithm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Lecture Notes / Concept Text
                </label>
                <textarea
                  value={genNotesText}
                  onChange={(e) => setGenNotesText(e.target.value)}
                  placeholder="Paste lecture excerpts, teacher notes, or textbook definitions here..."
                  rows={5}
                  required
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsGenModalOpen(false)}
                  disabled={isGenerating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  disabled={isGenerating}
                  className="min-h-[40px] text-xs gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {isGenerating ? "Synthesizing Deck..." : "Generate Study Set"}
                  </span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
