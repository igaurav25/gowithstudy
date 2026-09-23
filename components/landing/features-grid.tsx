import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  FileText,
  Sparkles,
  Code2,
  Briefcase,
  Users2,
  FolderGit2,
  ArrowUpRight,
} from "lucide-react";

export function LandingFeatures() {
  const features = [
    {
      icon: CalendarDays,
      badge: "Academics",
      title: "Academic Management",
      description:
        "Centralize your daily college schedule, weekly timetable, attendance alerts, and assignments with intelligent priority tags.",
      highlight: "Real-time class sync & reminders",
    },
    {
      icon: FileText,
      badge: "Storage",
      title: "Notes & Study Materials",
      description:
        "Upload lecture PDFs, syllabus documents, and revision sheets. Tag by subject, semester, and unit with full-text search.",
      highlight: "PDF reader & smart categorization",
    },
    {
      icon: Sparkles,
      badge: "AI Powered",
      title: "AI Study Assistant (RAG)",
      description:
        "Ask questions directly about your course slides and textbooks. Retrieve cited responses grounded specifically in your uploaded materials.",
      highlight: "Grounded context with exact page citations",
    },
    {
      icon: Code2,
      badge: "Placements",
      title: "Placement & DSA Tracker",
      description:
        "Track coding problems across Arrays, DP, Graphs, and Trees. Filter by difficulty, platform (LeetCode/GFG), and mark problems for revision.",
      highlight: "Structured topic roadmaps & analytics",
    },
    {
      icon: Briefcase,
      badge: "Career",
      title: "Internship & Job Tracker",
      description:
        "A private pipeline for your career hunt. Track application dates, company stages (Saved, Applied, Interview, Offer), and customized resumes.",
      highlight: "Kanban pipeline & deadline tracking",
    },
    {
      icon: Users2,
      badge: "Campus",
      title: "Student Community",
      description:
        "Engage with college peers in dedicated channels for Programming, Placements, Study Notes, and campus life with verified student badges.",
      highlight: "Moderated discussions & peer help",
    },
    {
      icon: FolderGit2,
      badge: "Collab",
      title: "Project Team Finder",
      description:
        "Looking for a frontend dev, ML engineer, or UI designer for your upcoming hackathon or final year capstone? Post listings and build your dream team.",
      highlight: "Skill-based matchmaking & requests",
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-28 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="purple" className="mb-4">
            Core Modules
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Engineered for every dimension of college life
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
            Replace scattered WhatsApp groups, disorganized Google Drive folders, and forgotten spreadsheets with a unified student command center.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            const isLarge = idx === 2; // AI feature emphasized
            return (
              <Card
                key={item.title}
                glass={isLarge}
                className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 ${
                  isLarge
                    ? "md:col-span-2 lg:col-span-1 border-indigo-500/40 bg-gradient-to-b from-indigo-50/40 dark:from-indigo-950/20 to-transparent"
                    : "hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <CardHeader className="p-7">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-200 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant={isLarge ? "purple" : "outline"} className="text-xs">
                      {item.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                    <span>{item.title}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                  <CardDescription className="mt-2 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {item.description}
                  </CardDescription>
                  <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    ✓ {item.highlight}
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
