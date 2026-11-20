import { requireAdminPermission } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { isDbConnected } from "@/lib/db-check";
import { AuthService } from "@/services/auth-service";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ShieldCheck, UserX, UserCheck } from "lucide-react";

export default async function AdminUsersPage() {
  await requireAdminPermission("USERS_VIEW");

  let usersList: any[] = [];
  if (await isDbConnected()) {
    const records = await prisma.user.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: { profile: true },
    });
    usersList = records.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.profile?.name || u.email.split("@")[0],
      role: u.role,
      accountStatus: u.accountStatus,
      isSuspended: u.isSuspended,
      college: u.profile?.college || "GoWithStudy",
      createdAt: u.createdAt.toLocaleDateString(),
    }));
  } else {
    // Disk store fallback
    const all = AuthService.getAllUsers();
    usersList = all.map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      accountStatus: u.accountStatus || "ACTIVE",
      isSuspended: Boolean(u.isSuspended),
      college: u.college,
      createdAt: u.createdAt.toLocaleDateString(),
    }));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            <span>Enrolled User Directory</span>
          </h1>
          <p className="text-xs text-zinc-400">
            Active students, educators, and administrative accounts ({usersList.length} total).
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {usersList.map((user) => (
          <Card
            key={user.id}
            className="border-zinc-800 bg-zinc-900/80 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
          >
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-zinc-100">{user.name}</span>
                <Badge
                  variant={
                    user.role === "SUPER_ADMIN"
                      ? "destructive"
                      : user.role === "ADMIN"
                      ? "warning"
                      : user.role === "TEACHER"
                      ? "default"
                      : "purple"
                  }
                  className="text-[10px] py-0"
                >
                  {user.role}
                </Badge>
                {user.isSuspended ? (
                  <Badge variant="destructive" className="text-[10px] py-0">
                    SUSPENDED
                  </Badge>
                ) : (
                  <Badge variant="success" className="text-[10px] py-0">
                    {user.accountStatus}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {user.email} · {user.college}
              </p>
            </div>

            <div className="text-xs text-zinc-500 font-mono">
              Joined {user.createdAt}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
