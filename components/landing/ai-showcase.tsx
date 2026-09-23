import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  FileCheck2,
  Database,
  Search,
  BookOpenCheck,
  CheckCircle2,
} from "lucide-react";

export function LandingAIShowcase() {
  const sources = [
    {
      type: "User Uploaded Notes (RAG)",
      desc: "Answers extracted and cited directly from your personal PDFs, professor slides, and lecture notes.",
      badge: "Grounded RAG",
      badgeColor: "success",
    },
    {
      type: "General Computer Science & Math",
      desc: "Instant conceptual clarity for OS, DBMS, Networks, Data Structures, OOP, and Discrete Mathematics.",
      badge: "AI Model",
      badgeColor: "purple",
    },
    {
      type: "Verified College Information",
      desc: "Official academic notices, exam dates, and policies are strictly served from verified college records — never halluncinated.",
      badge: "Verified Truth",
      badgeColor: "outline",
    },
  ];

  return (
    <section id="ai-assistant" className="py-20 sm:py-28 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: AI Description & Source Principles */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <Badge variant="purple">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Grounded AI Study Assistant
            </Badge>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
              Study smarter with AI that reads your actual lecture notes
            </h2>

            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Standard AI chatbots make things up. CampusFlow utilizes Retrieval-Augmented Generation (RAG) to embed and index your uploaded PDFs so every answer is backed by exact page citations from your course syllabus.
            </p>

            <div className="space-y-4 pt-2">
              {sources.map((src) => (
                <div
                  key={src.type}
                  className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {src.type}
                    </h3>
                    <Badge variant={src.badgeColor as "success" | "purple" | "outline"} className="text-[11px]">
                      {src.badge}
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {src.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Interactive Chat Simulation Card */}
          <div className="lg:col-span-6">
            <Card glass className="border-indigo-500/30 shadow-2xl shadow-indigo-500/10">
              <CardHeader className="border-b border-zinc-200/70 dark:border-zinc-800/70 py-4 px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">CampusFlow AI Copilot</CardTitle>
                      <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        Grounded in 4 Course Documents
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[11px]">RAG Engine v1.0</Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4 text-left">
                {/* User Message */}
                <div className="flex gap-3 justify-end">
                  <div className="max-w-[85%] p-3.5 rounded-2xl rounded-tr-none bg-indigo-600 text-white text-xs leading-relaxed shadow-sm">
                    Can you summarize the difference between 2PL (Two-Phase Locking) and Strict 2PL from my DBMS lecture notes?
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <BookOpenCheck className="w-4 h-4" />
                  </div>
                  <div className="max-w-[90%] space-y-3">
                    <div className="p-4 rounded-2xl rounded-tl-none border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/80 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed shadow-sm space-y-2">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                        Here is the exact comparison from your syllabus:
                      </p>
                      <ul className="space-y-1.5 list-disc list-inside text-zinc-700 dark:text-zinc-300">
                        <li>
                          <strong>Basic 2PL:</strong> Has a growing phase (acquires locks) and shrinking phase (releases locks). Vulnerable to cascading aborts.
                        </li>
                        <li>
                          <strong>Strict 2PL:</strong> Holds all exclusive (write) locks until the transaction commits or aborts, eliminating cascading rollbacks.
                        </li>
                      </ul>

                      {/* Source Citation Badge */}
                      <div className="mt-3 pt-3 border-t border-zinc-200/70 dark:border-zinc-800/70 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Source Grounding:</span>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium border border-indigo-200/60 dark:border-indigo-800/60">
                          <FileCheck2 className="w-3.5 h-3.5 text-indigo-500" />
                          <span>DBMS_Module4_Concurrency.pdf (Page 22)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input Simulation */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-400">
                    <Search className="w-4 h-4 text-zinc-400" />
                    <span>Ask another question about your uploaded notes...</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
