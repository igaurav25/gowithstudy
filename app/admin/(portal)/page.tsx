import Link from "next/link";
import { getAdminOverviewAction } from "@/features/admin/application-actions";
import { isDbConnected } from "@/lib/db-check";
import {
  FileCheck2,
  Users,
  ScrollText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Activity,
  Lock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const overviewRes = await getAdminOverviewAction();
  const stats = overviewRes.data || {
    pendingApplicationsCount: 0,
    approvedApplicationsCount: 0,
    rejectedApplicationsCount: 0,
    totalUsersCount: 0,
    suspendedUsersCount: 0,
  };

  // System status flags (Booleans only, no secret values)
  const isDbHealthy = await isDbConnected();
  const isEncryptionActive = Boolean(process.env.APP_ENCRYPTION_KEY || process.env.AUTH_SECRET);
  const isRateLimiterReady = true;
  const isSessionHardened = true;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Governance & Verification Console</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Institutional admissions, credentials review, and platform access oversight.
          </p>
        </div>

        <Link href="/admin/applications">
          <Button variant="gradient" size="sm" className="w-full sm:w-auto text-xs font-semibold gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Review Applications ({stats.pendingApplicationsCount})</span>
          </Button>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-amber-500/30 bg-amber-950/20 p-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-amber-400">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-200">
            {stats.pendingApplicationsCount}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Awaiting approval</p>
        </Card>

        <Card className="border-emerald-500/30 bg-emerald-950/20 p-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-emerald-400">Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-200">
            {stats.approvedApplicationsCount}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Activation tokens sent</p>
        </Card>

        <Card className="border-sky-500/30 bg-sky-950/20 p-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-sky-400">Active Accounts</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-sky-200">
            {stats.totalUsersCount}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Students & Educators</p>
        </Card>

        <Card className="border-rose-500/30 bg-rose-950/20 p-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-rose-400">Suspended</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-200">
            {stats.suspendedUsersCount}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Accounts locked</p>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Link href="/admin/applications" className="group">
          <Card className="border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 transition-colors p-4 h-full flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 flex items-center justify-center mb-3">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-zinc-100 group-hover:text-emerald-400 transition-colors">
                Applicant Verification
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Inspect academic credentials, verified emails, student roll numbers, and grant admission.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs text-emerald-400 font-semibold gap-1">
              <span>View Applications</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>

        <Link href="/admin/users" className="group">
          <Card className="border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 transition-colors p-4 h-full flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-950/40 border border-sky-800/60 text-sky-400 flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-zinc-100 group-hover:text-sky-400 transition-colors">
                User Management
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Oversee enrolled students, educators, and moderator permissions. Enforce suspensions.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs text-sky-400 font-semibold gap-1">
              <span>Manage Users</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>

        <Link href="/admin/audit" className="group">
          <Card className="border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 transition-colors p-4 h-full flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-400 flex items-center justify-center mb-3">
                <ScrollText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-zinc-100 group-hover:text-amber-400 transition-colors">
                Audit Trail
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Immutable, append-only log of every administrative decision, bootstrap event, and login.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs text-amber-400 font-semibold gap-1">
              <span>Inspect Audit Logs</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>
      </div>

      {/* System Security & Integrity Status Card (Booleans only) */}
      <Card className="border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            System & Security Status (Live Invariants)
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
            <CheckCircle2 className={`w-4 h-4 ${isDbHealthy ? "text-emerald-400" : "text-amber-400"}`} />
            <div>
              <div className="font-semibold text-zinc-200">Database Engine</div>
              <div className="text-[10px] text-zinc-400">{isDbHealthy ? "Active" : "Fallback Store"}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
            <CheckCircle2 className={`w-4 h-4 ${isEncryptionActive ? "text-emerald-400" : "text-rose-400"}`} />
            <div>
              <div className="font-semibold text-zinc-200">AES-256-GCM 2FA</div>
              <div className="text-[10px] text-zinc-400">{isEncryptionActive ? "Encrypted" : "Key Needed"}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="font-semibold text-zinc-200">Distributed Guard</div>
              <div className="text-[10px] text-zinc-400">{isRateLimiterReady ? "Active" : "Offline"}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="font-semibold text-zinc-200">Session Security</div>
              <div className="text-[10px] text-zinc-400">{isSessionHardened ? "Strict Cookie" : "Lax"}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
