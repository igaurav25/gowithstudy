import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Code2, Briefcase, CheckCircle2, TrendingUp, Sparkles, Building2 } from "lucide-react";

export function LandingCareerSection() {
  const dsaCategories = [
    { name: "Dynamic Programming", solved: 32, total: 45, pct: "71%" },
    { name: "Graphs & BFS/DFS", solved: 28, total: 35, pct: "80%" },
    { name: "Trees & Binary Search", solved: 40, total: 40, pct: "100%" },
    { name: "Arrays & Two Pointers", solved: 55, total: 60, pct: "91%" },
  ];

  const pipelineStages = [
    { company: "Google", role: "Software Engineering Intern", status: "OA Completed", date: "Oct 12", color: "purple" },
    { company: "Microsoft", role: "Summer Tech Intern", status: "Interview Round 2", date: "Oct 18", color: "success" },
    { company: "Amazon", role: "SDE-1 Graduate", status: "Applied", date: "Sep 28", color: "outline" },
    { company: "Atlassian", role: "Associate Software Engineer", status: "Offer Received", date: "Oct 05", color: "success" },
  ];

  return (
    <section id="career" className="py-20 sm:py-28 border-t border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="purple" className="mb-4">
            Career Accelerator
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            DSA mastery and job tracking under one roof
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
            Bridge the gap between your semester exams and off-campus/on-campus placement season with dedicated tools built for computer science students.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
          {/* Left: DSA Progress Tracker */}
          <Card className="p-2 sm:p-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Structured DSA Preparation</CardTitle>
                    <p className="text-xs text-zinc-500">155+ problems categorized by topic & difficulty</p>
                  </div>
                </div>
                <Badge variant="success">Active Streak: 18 Days</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-2">
              {dsaCategories.map((item) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-zinc-800 dark:text-zinc-200">{item.name}</span>
                    <span className="text-zinc-500 font-mono">
                      {item.solved}/{item.total} solved ({item.pct})
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                      style={{ width: item.pct }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-2 flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-100 dark:border-zinc-800">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Blind 75 & Striver SDE sheet synced
                </span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">View DSA Roadmap →</span>
              </div>
            </CardContent>
          </Card>

          {/* Right: Internship & Job Application Tracker */}
          <Card className="p-2 sm:p-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Job & Internship Tracker</CardTitle>
                    <p className="text-xs text-zinc-500">Manage application stages, deadlines & custom resumes</p>
                  </div>
                </div>
                <Badge variant="purple">4 Active Rounds</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {pipelineStages.map((job) => (
                <div
                  key={job.company}
                  className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/60 flex items-center justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-700 dark:text-zinc-300">
                      {job.company[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{job.company}</p>
                      <p className="text-[11px] text-zinc-500">{job.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={job.color as "purple" | "success" | "outline"} className="text-[10px]">
                      {job.status}
                    </Badge>
                    <p className="text-[10px] text-zinc-400 mt-1 font-mono">{job.date}</p>
                  </div>
                </div>
              ))}
              <div className="pt-2 flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-100 dark:border-zinc-800">
                <span>Never miss an assessment or interview round again</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">Manage Pipeline →</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
