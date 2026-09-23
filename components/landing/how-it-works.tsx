import { Badge } from "@/components/ui/badge";
import { UserCheck, UploadCloud, BrainCircuit, Rocket } from "lucide-react";

export function LandingHowItWorks() {
  const steps = [
    {
      step: "01",
      icon: UserCheck,
      title: "Set up your student profile",
      description:
        "Sign up with your college email, select your university, branch, year, and semester to configure your customized academic schedule.",
    },
    {
      step: "02",
      icon: UploadCloud,
      title: "Upload course materials & notes",
      description:
        "Import your syllabus, professor slides, and lecture PDFs. Organize documents neatly into course folders and subject tags.",
    },
    {
      step: "03",
      icon: BrainCircuit,
      title: "Query documents with AI (RAG)",
      description:
        "Ask questions on complex concepts or exam topics. The AI processes your uploaded notes and retrieves exact grounded page references.",
    },
    {
      step: "04",
      icon: Rocket,
      title: "Crack placements & track jobs",
      description:
        "Follow structured DSA problem sheets, maintain revision notes, manage job applications, and find partners for hackathon projects.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 border-t border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto">
          <Badge variant="purple" className="mb-4">
            Workflow
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            How CampusFlow powers your journey
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
            From your first semester lecture to placement day, follow a streamlined 4-step workflow designed for student success.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-sm hover:border-indigo-500/40 transition-all duration-200 flex flex-col"
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-2xl font-black text-indigo-600/30 dark:text-indigo-400/30 font-mono">
                    {item.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
