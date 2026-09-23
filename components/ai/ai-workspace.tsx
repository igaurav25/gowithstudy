"use client";

import * as React from "react";
import { NoteItem } from "@/services/notes-service";
import { AIMessage, AIStudyMode } from "@/lib/rag/types";
import { ChatMessageItem } from "@/components/ai/chat-message-item";
import { ChatInput } from "@/components/ai/chat-input";
import { PromptSuggestions } from "@/components/ai/prompt-suggestions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  askAssistantAction,
  generateQuizAction,
  generateSummaryAction,
} from "@/features/ai/actions";
import {
  Sparkles,
  FileText,
  RotateCcw,
  BookOpen,
  HelpCircle,
  FileCheck2,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface AIWorkspaceProps {
  availableNotes: NoteItem[];
  initialNoteId?: string;
}

export function AIWorkspace({
  availableNotes,
  initialNoteId = "ALL",
}: AIWorkspaceProps) {
  const [selectedNoteId, setSelectedNoteId] = React.useState<string>(initialNoteId);
  const [selectedMode, setSelectedMode] = React.useState<AIStudyMode>("EXPLAIN");
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  // Initial welcome message from CampusFlow AI
  const [messages, setMessages] = React.useState<AIMessage[]>([
    {
      id: "welcome_msg",
      role: "assistant",
      content: `👋 Hello! I am your **CampusFlow AI Study Copilot**.

I read and ground my responses directly in your uploaded lecture notes, syllabus PDFs, and revision materials using Retrieval-Augmented Generation (RAG).

**What would you like to explore today?**
* **Explain Concepts:** Ask for deep breakdowns of complex CS algorithms or systems topics with real-world analogies.
* **Practice Quizzes:** Test your exam readiness with interactive multiple-choice questions.
* **Cheatsheets & Summaries:** Generate structured revision templates and key formulas.
* **Code Implementation:** Get clean Java, C++, or Python algorithms with space/time complexity analysis.

Select a document from the context dropdown above or try one of the suggested prompts below!`,
      mode: "EXPLAIN",
      citations: [],
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Find currently selected note title
  const currentNote = availableNotes.find((n) => n.id === selectedNoteId);

  // Submit query
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");

    // Add user message
    const userMsg: AIMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: userText,
      mode: selectedMode,
      citations: [],
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await askAssistantAction({
        query: userText,
        noteId: selectedNoteId,
        mode: selectedMode,
        history: messages.map((m) => ({ role: m.role, content: m.content })),
      });

      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data!]);
      } else {
        const errorMsg: AIMessage = {
          id: `err_${Date.now()}`,
          role: "assistant",
          content: `⚠️ ${res.message || "Failed to generate response. Please try again."}`,
          mode: selectedMode,
          citations: [],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch {
      const errorMsg: AIMessage = {
        id: `err_${Date.now()}`,
        role: "assistant",
        content: "⚠️ An unexpected network error occurred while querying the study copilot.",
        mode: selectedMode,
        citations: [],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Action: Generate Quiz for current note
  const handleQuickQuiz = async () => {
    if (isLoading) return;
    setIsLoading(true);

    const userMsg: AIMessage = {
      id: `user_quiz_${Date.now()}`,
      role: "user",
      content: `🎯 Generate an interactive practice quiz for "${currentNote ? currentNote.title : "my course materials"}"`,
      mode: "QUIZ",
      citations: [],
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await generateQuizAction(selectedNoteId);
      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data!]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Action: Generate Summary for current note
  const handleQuickSummary = async () => {
    if (isLoading) return;
    setIsLoading(true);

    const userMsg: AIMessage = {
      id: `user_summary_${Date.now()}`,
      role: "user",
      content: `📝 Create a revision summary and cheatsheet for "${currentNote ? currentNote.title : "my course materials"}"`,
      mode: "SUMMARY",
      citations: [],
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await generateSummaryAction(selectedNoteId);
      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data!]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reset conversation
  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        role: "assistant",
        content: "New study session initiated! Select a document and ask a question to begin.",
        mode: "EXPLAIN",
        citations: [],
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 shadow-2xl backdrop-blur-xl overflow-hidden">
      {/* Top Workspace Header & Document Selector */}
      <div className="p-4 sm:px-6 border-b border-zinc-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                CampusFlow AI Copilot
              </h2>
              <Badge variant="purple" className="text-[10px] hidden sm:inline-flex">
                RAG Engine v1.0
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Document Grounding Active
            </p>
          </div>
        </div>

        {/* Document Context Selector Dropdown */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <select
              value={selectedNoteId}
              onChange={(e) => setSelectedNoteId(e.target.value)}
              aria-label="Select grounded study document"
              className="h-9 pl-3 pr-8 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[240px] truncate cursor-pointer"
            >
              <option value="ALL">📚 All Course Materials</option>
              <option value="GENERAL">🌐 General Computer Science</option>
              {availableNotes.map((note) => (
                <option key={note.id} value={note.id}>
                  📄 {note.title}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Quiz & Summary Shortcuts */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleQuickQuiz}
            disabled={isLoading}
            className="h-9 text-xs border-indigo-200 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 gap-1 hidden md:flex"
            title="Generate practice quiz from selected document"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Quiz Me</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleQuickSummary}
            disabled={isLoading}
            className="h-9 text-xs border-purple-200 dark:border-purple-900/60 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 gap-1 hidden md:flex"
            title="Generate cheatsheet from selected document"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Summary</span>
          </Button>

          {/* Reset session button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleResetChat}
            className="h-9 w-9 p-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            title="Start new conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Center Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((msg) => (
          <ChatMessageItem key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <div className="flex gap-3.5 items-center animate-in fade-in">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              <span>Analyzing document chunks & generating grounded response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Area: Suggestions & Chat Input */}
      <div className="p-4 border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-3 shrink-0">
        <PromptSuggestions
          onSelectPrompt={(prompt, mode) => {
            if (mode) setSelectedMode(mode);
            setInput(prompt);
          }}
        />

        <ChatInput
          input={input}
          onInputChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          selectedMode={selectedMode}
          onModeChange={setSelectedMode}
        />
      </div>
    </div>
  );
}
