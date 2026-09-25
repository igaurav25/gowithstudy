"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function LandingFAQSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const faqs = [
    {
      q: "How does the AI Study Assistant answer questions from my PDFs?",
      a: "GoWithStudy uses Retrieval-Augmented Generation (RAG). When you upload a lecture PDF, our pipeline extracts the text, segments it into semantic chunks, and creates vector embeddings. When you ask a question, the system finds the most relevant passages from your document and feeds them into the AI model, producing accurate answers with exact page numbers.",
    },
    {
      q: "Is my personal data and job application tracker kept private?",
      a: "Yes. All your study notes, personal timetable, assignments, DSA logs, and internship pipeline entries are strictly tied to your authenticated user ID. Nobody else — not even other students from your college — can view your private records.",
    },
    {
      q: "Can I use GoWithStudy on my phone or tablet?",
      a: "Absolutely. GoWithStudy is built using mobile-first responsive architecture. The timetable, notifications, assignment checklists, and AI chat work seamlessly across smartphones, tablets, and desktop displays.",
    },
    {
      q: "How does the Project Team Finder work?",
      a: "Students can post project listings specifying the required tech stack (e.g., React, PyTorch, Node.js), roles needed (Frontend, Backend, ML), and current team size. Interested classmates can submit a join request, which the project creator can review, accept, or decline.",
    },
    {
      q: "What types of files can I upload to Notes?",
      a: "Currently, GoWithStudy supports standard PDF documents up to 25MB each. Future updates will also support DOCX and Markdown formats.",
    },
    {
      q: "How does GoWithStudy ensure official college information is accurate?",
      a: "Official announcements, notices, and exam timetables are strictly managed by verified College Administrators and Moderators. AI is never allowed to invent or hallucinate official institutional policies.",
    },
  ];

  return (
    <section id="faq" className="py-20 sm:py-28 border-t border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="purple" className="mb-4">
            Frequently Asked Questions
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Got questions? We have answers.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
            Everything you need to know about the platform, AI grounding, and student security.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-semibold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 shrink-0 text-zinc-400 transition-transform duration-200",
                      isOpen && "rotate-180 text-indigo-600 dark:text-indigo-400"
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
