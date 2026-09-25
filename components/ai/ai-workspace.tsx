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
  RotateCcw,
  HelpCircle,
  FileText,
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
  const [isStreaming, setIsStreaming] = React.useState(false);

  // Initial welcome message from CampusFlow AI
  const [messages, setMessages] = React.useState<AIMessage[]>([
    {
      id: "welcome_msg",
      role: "assistant",
      content: `👋 Hello! I am your **CampusFlow AI Study Copilot** (ChatGPT-style with Document Grounding).

I ground my responses directly in your accredited B.Tech CSE syllabus, lecture notes, and revision materials using Retrieval-Augmented Generation (RAG).

**What would you like to explore today?**
* **Explain Concepts:** Deep breakdown of CPU Scheduling, Deadlocks, Normalization (1NF-BCNF), TCP/IP Handshake, or DP Knapsack.
* **Practice Quizzes:** Test your exam readiness with interactive multiple-choice questions.
* **Cheatsheets & Summaries:** Generate structured revision templates and key formulas.
* **Code Implementation:** Clean C, Java, or Python algorithms with space/time complexity analysis.

Select a document from the context dropdown or try one of the suggested prompts below!`,
      mode: "EXPLAIN",
      citations: [],
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const streamTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastUserQueryRef = React.useRef<string>("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isStreaming]);

  // Cleanup streaming timer on unmount
  React.useEffect(() => {
    return () => {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    };
  }, []);

  // Find currently selected note title
  const currentNote = availableNotes.find((n) => n.id === selectedNoteId);

  // Progressive Typewriter Streaming Engine (ChatGPT-style)
  const streamResponse = (
    assistantMsgId: string,
    fullText: string,
    citations: any[] = [],
    quizQuestions?: any[],
    followUps?: string[]
  ) => {
    if (streamTimerRef.current) clearInterval(streamTimerRef.current);

    setIsStreaming(true);
    let currentIdx = 0;
    // Chunk size calculated so full typing completes smoothly in ~1.2s to 2s
    const totalChars = fullText.length;
    const chunkSize = Math.max(3, Math.ceil(totalChars / 75));

    streamTimerRef.current = setInterval(() => {
      currentIdx = Math.min(currentIdx + chunkSize, totalChars);
      const partialText = fullText.slice(0, currentIdx);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: partialText, isStreaming: true }
            : m
        )
      );

      if (currentIdx >= totalChars) {
        if (streamTimerRef.current) clearInterval(streamTimerRef.current);
        streamTimerRef.current = null;
        setIsStreaming(false);

        // Finalize message with complete citations and suggestions
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: fullText,
                  isStreaming: false,
                  citations,
                  quizQuestions,
                  followUps,
                }
              : m
          )
        );
      }
    }, 18);
  };

  // Stop generating button handler
  const handleStopStreaming = () => {
    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }
    setIsStreaming(false);
    setIsLoading(false);
    setMessages((prev) =>
      prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m))
    );
  };

  // Submit query
  const executeQuery = async (queryText: string) => {
    if (!queryText.trim() || isLoading || isStreaming) return;

    lastUserQueryRef.current = queryText;
    const userMsgId = `user_${Date.now()}`;
    const assistantMsgId = `assistant_${Date.now()}`;

    // Add user message
    const userMsg: AIMessage = {
      id: userMsgId,
      role: "user",
      content: queryText,
      mode: selectedMode,
      citations: [],
      timestamp: new Date(),
    };

    // Add placeholder assistant message
    const initialAssistantMsg: AIMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      mode: selectedMode,
      citations: [],
      isStreaming: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, initialAssistantMsg]);
    setIsLoading(true);

    try {
      const res = await askAssistantAction({
        query: queryText,
        noteId: selectedNoteId,
        mode: selectedMode,
        history: messages.map((m) => ({ role: m.role, content: m.content })),
      });

      setIsLoading(false);

      if (res.success && res.data) {
        streamResponse(
          assistantMsgId,
          res.data.content,
          res.data.citations,
          res.data.quizQuestions,
          res.data.followUps
        );
      } else {
        const errorContent = `⚠️ ${res.message || "Failed to generate response. Please try again."}`;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: errorContent, isStreaming: false }
              : m
          )
        );
      }
    } catch {
      setIsLoading(false);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: "⚠️ An unexpected network error occurred while querying the study copilot.",
                isStreaming: false,
              }
            : m
        )
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    executeQuery(text);
  };

  // Quick Action: Generate Quiz for current note
  const handleQuickQuiz = async () => {
    if (isLoading || isStreaming) return;
    const prompt = `🎯 Generate an interactive practice quiz for "${currentNote ? currentNote.title : "my course materials"}"`;
    executeQuery(prompt);
  };

  // Quick Action: Generate Summary for current note
  const handleQuickSummary = async () => {
    if (isLoading || isStreaming) return;
    const prompt = `📝 Create a revision summary and cheatsheet for "${currentNote ? currentNote.title : "my course materials"}"`;
    executeQuery(prompt);
  };

  // Handle clicking a follow-up suggestion chip
  const handleSelectSuggestion = (suggestion: string) => {
    setInput("");
    executeQuery(suggestion);
  };

  // Handle regenerating response
  const handleRegenerate = () => {
    if (lastUserQueryRef.current && !isLoading && !isStreaming) {
      executeQuery(lastUserQueryRef.current);
    }
  };

  // Reset conversation
  const handleResetChat = () => {
    if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    setIsStreaming(false);
    setIsLoading(false);
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        role: "assistant",
        content: "New study session initiated! Select a document and ask an academic question to begin.",
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
                ChatGPT Stream
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
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
            disabled={isLoading || isStreaming}
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
            disabled={isLoading || isStreaming}
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
        {messages.map((msg, idx) => (
          <ChatMessageItem
            key={msg.id || idx}
            message={msg}
            onSelectSuggestion={handleSelectSuggestion}
            onRegenerate={idx === messages.length - 1 && msg.role === "assistant" ? handleRegenerate : undefined}
          />
        ))}

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
          isStreaming={isStreaming}
          onStopStreaming={handleStopStreaming}
          selectedMode={selectedMode}
          onModeChange={setSelectedMode}
        />
      </div>
    </div>
  );
}
