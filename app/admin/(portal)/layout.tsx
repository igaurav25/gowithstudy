import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession, getSession } from "@/lib/auth";
import { requireAdmin, requireAdminPermission } from "@/lib/guards";
import {
  ShieldCheck,
  Users,
  FileCheck2,
  ScrollText,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { adminLogoutAction } from "@/features/admin/auth-actions";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let adminUser: { email: string; role: string; name?: string } | null = null;
  try {
    const auth = await requireAdmin();
    await requireAdminPermission("ADMIN_PORTAL_ACCESS");
    adminUser = {
      email: auth.adminUser.email,
      role: auth.adminUser.role,
      name: auth.adminUser.name,
    };
  } catch {
    redirect("/login?mode=admin");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Top Navigation Bar (Mobile-first, sticky) */}
      <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm sm:text-base tracking-tight text-white">
                GoWithStudy <span className="text-indigo-400 font-mono text-xs ml-1">Admin</span>
              </span>
            </Link>

            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">
              {adminUser.role}
            </span>
          </div>

          {/* User badge and logout */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-zinc-400 hidden md:inline truncate max-w-[150px]">
              {adminUser.email}
            </span>
            <form
              action={async () => {
                "use server";
                await adminLogoutAction();
              }}
            >
              <button
                type="submit"
                title="Log out of admin console"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-xs text-zinc-300 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </form>
          </div>
        </div>

        {/* Subnav links: Horizontally scrollable on mobile (360px) */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center gap-1 sm:gap-2 overflow-x-auto py-1.5 text-xs scrollbar-none border-t border-zinc-800/60">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-800/80 text-zinc-300 hover:text-white transition-colors whitespace-nowrap"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
            <span>Overview</span>
          </Link>
          <Link
            href="/admin/applications"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-800/80 text-zinc-300 hover:text-white transition-colors whitespace-nowrap"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Applications</span>
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-800/80 text-zinc-300 hover:text-white transition-colors whitespace-nowrap"
          >
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>User Accounts</span>
          </Link>
          <Link
            href="/admin/audit"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-800/80 text-zinc-300 hover:text-white transition-colors whitespace-nowrap"
          >
            <ScrollText className="w-3.5 h-3.5 text-amber-400" />
            <span>Audit Trail</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">{children}</main>
    </div>
  );
}
