import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Lock, KeyRound, FileCheck, EyeOff, Shield } from "lucide-react";

export function LandingSecuritySection() {
  const securityPillars = [
    {
      icon: Lock,
      title: "Encrypted Sessions & Secure Cookies",
      description:
        "Authentication tokens are never stored in localStorage where XSS can steal them. We enforce HttpOnly, SameSite strict cookies with server-side invalidation.",
    },
    {
      icon: EyeOff,
      title: "Strict Data Privacy & Ownership",
      description:
        "Your private notes, resume drafts, and job application tracking remain 100% private to you with server-enforced ownership checks on every API route.",
    },
    {
      icon: Shield,
      title: "Role-Based Access Control (RBAC)",
      description:
        "Granular server-enforced permissions between Students, Community Moderators, and Administrators. Interface elements are never the sole line of defense.",
    },
    {
      icon: FileCheck,
      title: "Sanitized Uploads & Validation",
      description:
        "Uploaded study documents are validated for MIME type, file signature, size restrictions, and sanitized before passing into vector pipelines.",
    },
  ];

  return (
    <section className="py-20 sm:py-28 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="purple" className="mb-4">
            Security & Trust
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Security built as a first-class feature
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
            CampusFlow was architected from line one following defense-in-depth security principles. Your academic data, career records, and credentials are protected at all times.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {securityPillars.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-7 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-sm flex items-start gap-4 hover:border-indigo-500/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
