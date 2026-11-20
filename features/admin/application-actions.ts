"use server";

import { revalidatePath } from "next/cache";
import { requireAdminPermission } from "@/lib/guards";
import { ApplicationService } from "@/services/application-service";
import { prisma } from "@/lib/prisma";
import { isDbConnected } from "@/lib/db-check";
import type { ActionResult } from "@/features/auth/actions";

/**
 * Lists applications for the admin console with optional filters.
 */
export async function getAdminApplicationsAction(params: {
  status?: string;
  type?: string;
  search?: string;
}): Promise<ActionResult<{ applications: any[] }>> {
  try {
    await requireAdminPermission("APPLICATIONS_VIEW");
    const list = await ApplicationService.listApplications(params);
    return { success: true, data: { applications: list } };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

/**
 * Approves a pending application and issues an activation token.
 */
export async function approveApplicationAction(applicationId: string): Promise<
  ActionResult<{ activationLink?: string; rawToken?: string }>
> {
  try {
    const { adminUser } = await requireAdminPermission("APPLICATIONS_REVIEW");
    const res = await ApplicationService.approveApplication({
      applicationId,
      reviewerId: adminUser.id,
    });

    if (!res.success) {
      return { success: false, message: res.message };
    }

    revalidatePath("/admin/applications");
    revalidatePath("/admin");

    return {
      success: true,
      message: res.message,
      data: {
        activationLink: res.activationLink,
        rawToken: res.rawActivationToken,
      },
    };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

/**
 * Rejects a pending application with an administrative reason.
 */
export async function rejectApplicationAction(params: {
  applicationId: string;
  rejectionReason: string;
}): Promise<ActionResult> {
  try {
    const { adminUser } = await requireAdminPermission("APPLICATIONS_REVIEW");
    const res = await ApplicationService.rejectApplication({
      applicationId: params.applicationId,
      reviewerId: adminUser.id,
      rejectionReason: params.rejectionReason,
    });

    if (!res.success) {
      return { success: false, message: res.message };
    }

    revalidatePath("/admin/applications");
    revalidatePath("/admin");

    return { success: true, message: res.message };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

/**
 * Fetches overview metrics for the admin dashboard.
 */
export async function getAdminOverviewAction(): Promise<
  ActionResult<{
    pendingApplicationsCount: number;
    approvedApplicationsCount: number;
    rejectedApplicationsCount: number;
    totalUsersCount: number;
    suspendedUsersCount: number;
  }>
> {
  try {
    await requireAdminPermission("ADMIN_PORTAL_ACCESS");

    if (await isDbConnected()) {
      const [pending, approved, rejected, users, suspended] = await Promise.all([
        prisma.application.count({ where: { status: "PENDING" } }),
        prisma.application.count({ where: { status: "APPROVED" } }),
        prisma.application.count({ where: { status: "REJECTED" } }),
        prisma.user.count(),
        prisma.user.count({ where: { isSuspended: true } }),
      ]);

      return {
        success: true,
        data: {
          pendingApplicationsCount: pending,
          approvedApplicationsCount: approved,
          rejectedApplicationsCount: rejected,
          totalUsersCount: users,
          suspendedUsersCount: suspended,
        },
      };
    } else {
      const apps = await ApplicationService.listApplications();
      return {
        success: true,
        data: {
          pendingApplicationsCount: apps.filter((a) => a.status === "PENDING").length,
          approvedApplicationsCount: apps.filter((a) => a.status === "APPROVED").length,
          rejectedApplicationsCount: apps.filter((a) => a.status === "REJECTED").length,
          totalUsersCount: 148,
          suspendedUsersCount: 0,
        },
      };
    }
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

/**
 * Fetches audit logs for the security overview.
 */
export async function getAdminAuditLogsAction(): Promise<ActionResult<{ logs: any[] }>> {
  try {
    await requireAdminPermission("AUDIT_LOG_VIEW");

    if (await isDbConnected()) {
      const logs = await prisma.auditLog.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { email: true, role: true, profile: { select: { name: true } } },
          },
        },
      });

      return {
        success: true,
        data: {
          logs: logs.map((l) => ({
            id: l.id,
            action: l.action,
            entity: l.entity,
            entityId: l.entityId,
            actorEmail: l.user?.email || "System",
            actorName: l.user?.profile?.name || l.actorRole || "System",
            actorRole: l.actorRole || l.user?.role || "SYSTEM",
            ipAddress: l.ipAddress || "Internal",
            metadata: l.metadata,
            createdAt: l.createdAt.toISOString(),
          })),
        },
      };
    } else {
      return {
        success: true,
        data: {
          logs: [
            {
              id: "log_1",
              action: "SUPER_ADMIN_BOOTSTRAP",
              entity: "USER",
              actorEmail: "admin@gowithstudy.app",
              actorName: "Super Admin",
              actorRole: "SUPER_ADMIN",
              ipAddress: "127.0.0.1",
              metadata: { note: "Local disk environment" },
              createdAt: new Date().toISOString(),
            },
          ],
        },
      };
    }
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}
