import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { isDbConnected } from "@/lib/db-check";
import { canonicalizeEmail, canonicalizePhone } from "@/lib/canonicalize";
import {
  StudentApplicationInput,
  TeacherApplicationInput,
  ApplicationLookupInput,
} from "@/schemas/application";

export interface StoredApplication {
  id: string;
  referenceId: string;
  type: "STUDENT" | "TEACHER";
  status: "PENDING" | "APPROVED" | "REJECTED";
  fullName: string;
  email: string;
  emailCanonical: string;
  phone: string;
  phoneE164: string;
  college: string;
  course?: string | null;
  branch?: string | null;
  year?: number | null;
  rollNumber?: string | null;
  rollNumberNorm?: string | null;
  idProofUrl?: string | null;
  institution?: string | null;
  designation?: string | null;
  qualification?: string | null;
  department?: string | null;
  experienceYears?: number | null;
  teacherIdNumber?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  rejectionReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory application store for fallback / tests
const inMemoryApplications = new Map<string, StoredApplication>();

/**
 * Generates an applicant-friendly reference ID: e.g. GWS-7X9B2K4L
 */
export function generateReferenceId(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // No lookalikes (0, O, 1, I)
  let code = "";
  const randomBytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    code += chars[randomBytes[i] % chars.length];
  }
  return `GWS-${code}`;
}

export class ApplicationService {
  /**
   * Submits a student application with canonicalization, duplicate protection and audit logging.
   */
  static async submitStudentApplication(
    input: StudentApplicationInput,
    clientMetadata: { ip?: string; userAgent?: string } = {}
  ): Promise<{ success: boolean; message: string; referenceId?: string }> {
    const canonicalEmail = canonicalizeEmail(input.email);
    const phoneRes = canonicalizePhone(input.phone);
    if (!phoneRes.isValid) {
      return { success: false, message: phoneRes.errorMessage || "Invalid phone number." };
    }
    const phoneE164 = phoneRes.e164;
    const rollNumberNorm = input.rollNumber.trim().toUpperCase().replace(/[\s\-_/]/g, "");

    // 1. Check if user account already exists with this email
    if (await isDbConnected()) {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: input.email }, { emailCanonical: canonicalEmail }],
        },
      });
      if (existingUser) {
        return {
          success: false,
          message: "An active user account is already registered with this email address. Please sign in.",
        };
      }

      // 2. Check for duplicate pending application by email
      const pendingEmail = await prisma.application.findFirst({
        where: { emailCanonical: canonicalEmail, status: "PENDING" },
      });
      if (pendingEmail) {
        return {
          success: false,
          message: `An application with this email address is already under review (Reference: ${pendingEmail.referenceId}). Track your status at /apply/status.`,
        };
      }

      // 3. Check for duplicate pending application by phone
      const pendingPhone = await prisma.application.findFirst({
        where: { phoneE164, status: "PENDING" },
      });
      if (pendingPhone) {
        return {
          success: false,
          message: `An application with this phone number is already under review (Reference: ${pendingPhone.referenceId}). Track status at /apply/status.`,
        };
      }

      // 4. Check for duplicate roll number per college across PENDING/APPROVED
      const duplicateRoll = await prisma.application.findFirst({
        where: {
          college: input.college.trim(),
          rollNumberNorm,
          type: "STUDENT",
          status: { in: ["PENDING", "APPROVED"] },
        },
      });
      if (duplicateRoll) {
        return {
          success: false,
          message: `Student Roll Number '${input.rollNumber}' at ${input.college} has already been registered or is currently under review.`,
        };
      }

      // 5. Create Application record
      const referenceId = generateReferenceId();
      const app = await prisma.application.create({
        data: {
          referenceId,
          type: "STUDENT",
          status: "PENDING",
          fullName: input.fullName.trim(),
          email: input.email.trim(),
          emailCanonical: canonicalEmail,
          phone: input.phone.trim(),
          phoneE164,
          college: input.college.trim(),
          course: input.course.trim(),
          branch: input.branch.trim(),
          year: input.year,
          rollNumber: input.rollNumber.trim(),
          rollNumberNorm,
          idProofUrl: input.idProofUrl || null,
          ipAddress: clientMetadata.ip || null,
          userAgent: clientMetadata.userAgent || null,
        },
      });

      // Write audit log
      try {
        await prisma.auditLog.create({
          data: {
            action: "APPLICATION_SUBMITTED",
            entity: "APPLICATION",
            entityId: app.id,
            ipAddress: clientMetadata.ip || null,
            metadata: {
              referenceId,
              type: "STUDENT",
              college: input.college,
              emailCanonical: canonicalEmail,
            },
          },
        });
      } catch {
        // Non-critical audit failure
      }

      return {
        success: true,
        message: "Your student application has been submitted successfully.",
        referenceId,
      };
    } else {
      // In-Memory Fallback
      for (const existing of inMemoryApplications.values()) {
        if (existing.emailCanonical === canonicalEmail && existing.status === "PENDING") {
          return {
            success: false,
            message: `An application with this email is already under review (Reference: ${existing.referenceId}).`,
          };
        }
        if (existing.phoneE164 === phoneE164 && existing.status === "PENDING") {
          return {
            success: false,
            message: `An application with this phone is already under review (Reference: ${existing.referenceId}).`,
          };
        }
        if (
          existing.type === "STUDENT" &&
          existing.college.toLowerCase() === input.college.trim().toLowerCase() &&
          existing.rollNumberNorm === rollNumberNorm &&
          ["PENDING", "APPROVED"].includes(existing.status)
        ) {
          return {
            success: false,
            message: `Student Roll Number '${input.rollNumber}' at ${input.college} is already registered.`,
          };
        }
      }

      const referenceId = generateReferenceId();
      const newApp: StoredApplication = {
        id: `app_${Date.now()}`,
        referenceId,
        type: "STUDENT",
        status: "PENDING",
        fullName: input.fullName.trim(),
        email: input.email.trim(),
        emailCanonical: canonicalEmail,
        phone: input.phone.trim(),
        phoneE164,
        college: input.college.trim(),
        course: input.course.trim(),
        branch: input.branch.trim(),
        year: input.year,
        rollNumber: input.rollNumber.trim(),
        rollNumberNorm,
        idProofUrl: input.idProofUrl || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryApplications.set(referenceId, newApp);

      return {
        success: true,
        message: "Your student application has been submitted successfully.",
        referenceId,
      };
    }
  }

  /**
   * Submits a teacher application with credential verification.
   */
  static async submitTeacherApplication(
    input: TeacherApplicationInput,
    clientMetadata: { ip?: string; userAgent?: string } = {}
  ): Promise<{ success: boolean; message: string; referenceId?: string }> {
    const canonicalEmail = canonicalizeEmail(input.email);
    const phoneRes = canonicalizePhone(input.phone);
    if (!phoneRes.isValid) {
      return { success: false, message: phoneRes.errorMessage || "Invalid phone number." };
    }
    const phoneE164 = phoneRes.e164;

    if (await isDbConnected()) {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: input.email }, { emailCanonical: canonicalEmail }],
        },
      });
      if (existingUser) {
        return {
          success: false,
          message: "An active user account is already registered with this email address. Please sign in.",
        };
      }

      const pending = await prisma.application.findFirst({
        where: { emailCanonical: canonicalEmail, status: "PENDING" },
      });
      if (pending) {
        return {
          success: false,
          message: `An educator application with this email address is already under review (Reference: ${pending.referenceId}). Track status at /apply/status.`,
        };
      }

      const referenceId = generateReferenceId();
      const app = await prisma.application.create({
        data: {
          referenceId,
          type: "TEACHER",
          status: "PENDING",
          fullName: input.fullName.trim(),
          email: input.email.trim(),
          emailCanonical: canonicalEmail,
          phone: input.phone.trim(),
          phoneE164,
          college: input.institution.trim(),
          institution: input.institution.trim(),
          designation: input.designation.trim(),
          qualification: input.qualification.trim(),
          department: input.department.trim(),
          experienceYears: input.experienceYears,
          teacherIdNumber: input.teacherIdNumber?.trim() || null,
          ipAddress: clientMetadata.ip || null,
          userAgent: clientMetadata.userAgent || null,
        },
      });

      try {
        await prisma.auditLog.create({
          data: {
            action: "APPLICATION_SUBMITTED",
            entity: "APPLICATION",
            entityId: app.id,
            ipAddress: clientMetadata.ip || null,
            metadata: {
              referenceId,
              type: "TEACHER",
              institution: input.institution,
              emailCanonical: canonicalEmail,
            },
          },
        });
      } catch {
        // Ignore non-fatal audit error
      }

      return {
        success: true,
        message: "Your educator application has been submitted successfully.",
        referenceId,
      };
    } else {
      for (const existing of inMemoryApplications.values()) {
        if (existing.emailCanonical === canonicalEmail && existing.status === "PENDING") {
          return {
            success: false,
            message: `An application with this email is already under review (Reference: ${existing.referenceId}).`,
          };
        }
      }

      const referenceId = generateReferenceId();
      const newApp: StoredApplication = {
        id: `app_${Date.now()}`,
        referenceId,
        type: "TEACHER",
        status: "PENDING",
        fullName: input.fullName.trim(),
        email: input.email.trim(),
        emailCanonical: canonicalEmail,
        phone: input.phone.trim(),
        phoneE164,
        college: input.institution.trim(),
        institution: input.institution.trim(),
        designation: input.designation.trim(),
        qualification: input.qualification.trim(),
        department: input.department.trim(),
        experienceYears: input.experienceYears,
        teacherIdNumber: input.teacherIdNumber?.trim() || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryApplications.set(referenceId, newApp);

      return {
        success: true,
        message: "Your educator application has been submitted successfully.",
        referenceId,
      };
    }
  }

  /**
   * Looks up application status by Reference ID and matching email.
   */
  static async lookupStatus(
    input: ApplicationLookupInput
  ): Promise<{ success: boolean; message: string; application?: StoredApplication }> {
    const canonical = canonicalizeEmail(input.email);
    const refId = input.referenceId.trim().toUpperCase();

    if (await isDbConnected()) {
      const app = await prisma.application.findUnique({
        where: { referenceId: refId },
      });

      if (!app || app.emailCanonical !== canonical) {
        return {
          success: false,
          message: "No application matching this Reference ID and email address was found.",
        };
      }

      return {
        success: true,
        message: "Application located.",
        application: {
          ...app,
          type: app.type as "STUDENT" | "TEACHER",
          status: app.status as "PENDING" | "APPROVED" | "REJECTED",
        },
      };
    } else {
      const app = inMemoryApplications.get(refId);
      if (!app || app.emailCanonical !== canonical) {
        return {
          success: false,
          message: "No application matching this Reference ID and email address was found.",
        };
      }

      return {
        success: true,
        message: "Application located.",
        application: app,
      };
    }
  }

  /**
   * Resets in-memory storage (useful for isolated unit testing).
   */
  static _resetInMemory() {
    inMemoryApplications.clear();
  }

  /**
   * Lists all applications with optional status and search filtering.
   */
  static async listApplications(params: {
    status?: string;
    type?: string;
    search?: string;
  } = {}): Promise<StoredApplication[]> {
    const { status, type, search } = params;

    if (await isDbConnected()) {
      const where: any = {};
      if (status && status !== "ALL") where.status = status;
      if (type && type !== "ALL") where.type = type;
      if (search && search.trim()) {
        const s = search.trim();
        where.OR = [
          { fullName: { contains: s, mode: "insensitive" } },
          { email: { contains: s, mode: "insensitive" } },
          { referenceId: { contains: s, mode: "insensitive" } },
          { rollNumber: { contains: s, mode: "insensitive" } },
          { college: { contains: s, mode: "insensitive" } },
        ];
      }

      const list = await prisma.application.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });

      return list.map((a) => ({
        ...a,
        type: a.type as "STUDENT" | "TEACHER",
        status: a.status as "PENDING" | "APPROVED" | "REJECTED",
      }));
    } else {
      let list = Array.from(inMemoryApplications.values());
      if (status && status !== "ALL") {
        list = list.filter((a) => a.status === status);
      }
      if (type && type !== "ALL") {
        list = list.filter((a) => a.type === type);
      }
      if (search && search.trim()) {
        const s = search.trim().toLowerCase();
        list = list.filter(
          (a) =>
            a.fullName.toLowerCase().includes(s) ||
            a.email.toLowerCase().includes(s) ||
            a.referenceId.toLowerCase().includes(s) ||
            (a.rollNumber && a.rollNumber.toLowerCase().includes(s)) ||
            (a.college && a.college.toLowerCase().includes(s))
        );
      }
      return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }

  /**
   * Approves an application inside a transaction with strict concurrency guard (WHERE status = 'PENDING').
   * Generates a 32-byte CSPRNG activation token (48h expiry) and prepares activation.
   */
  static async approveApplication(params: {
    applicationId: string;
    reviewerId: string;
    appUrl?: string;
  }): Promise<{
    success: boolean;
    message: string;
    rawActivationToken?: string;
    activationLink?: string;
  }> {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
    const baseUrl = params.appUrl || process.env.NEXT_PUBLIC_APP_URL || "https://gowithstudy.vercel.app";
    const activationLink = `${baseUrl}/activate?token=${rawToken}`;

    if (await isDbConnected()) {
      try {
        const result = await prisma.$transaction(async (tx) => {
          // Strict concurrency guard: only approve if still PENDING
          const app = await tx.application.findUnique({
            where: { id: params.applicationId },
          });

          if (!app) {
            throw new Error("Application not found.");
          }

          if (app.status !== "PENDING") {
            throw new Error(`Application has already been processed (Current status: ${app.status}).`);
          }

          // 1. Update application status
          const updatedApp = await tx.application.update({
            where: { id: app.id },
            data: {
              status: "APPROVED",
              reviewedBy: params.reviewerId,
              reviewedAt: new Date(),
            },
          });

          // 2. Create Activation Token
          await tx.activationToken.create({
            data: {
              applicationId: updatedApp.id,
              tokenHash,
              expiresAt,
            },
          });

          // 3. Create or Draft User record in PENDING_ACTIVATION
          const targetRole = updatedApp.type === "TEACHER" ? "TEACHER" : "STUDENT";
          const user = await tx.user.create({
            data: {
              email: updatedApp.email,
              emailCanonical: updatedApp.emailCanonical,
              phone: updatedApp.phone,
              phoneE164: updatedApp.phoneE164,
              role: targetRole as any,
              accountStatus: "PENDING_ACTIVATION",
              isLegacy: false,
              emailVerified: true,
              applicationId: updatedApp.id,
              profile: {
                create: {
                  name: updatedApp.fullName,
                  college: updatedApp.college || "Academic Institution",
                  course: updatedApp.course || (updatedApp.type === "TEACHER" ? "Faculty" : "B.Tech"),
                  branch: updatedApp.branch || updatedApp.department || "General",
                  year: updatedApp.year || 1,
                  semester: 1,
                },
              },
            },
          });

          // 4. Audit Log
          await tx.auditLog.create({
            data: {
              userId: params.reviewerId,
              actorRole: "ADMIN",
              action: "APPLICATION_APPROVED",
              entity: "APPLICATION",
              entityId: updatedApp.id,
              metadata: {
                referenceId: updatedApp.referenceId,
                applicantEmail: updatedApp.email,
                type: updatedApp.type,
                createdUserId: user.id,
                activationExpiresAt: expiresAt.toISOString(),
              },
            },
          });

          return { updatedApp, user };
        });

        console.log(`[APPLICATION_APPROVED] Reference: ${result.updatedApp.referenceId}`);
        console.log(`[ACTIVATION_DISPATCH] Link: ${activationLink}`);

        return {
          success: true,
          message: "Application approved successfully. Activation link dispatched to applicant.",
          rawActivationToken: rawToken,
          activationLink,
        };
      } catch (err) {
        return { success: false, message: (err as Error).message };
      }
    } else {
      // In-Memory Fallback
      let target: StoredApplication | undefined;
      for (const app of inMemoryApplications.values()) {
        if (app.id === params.applicationId || app.referenceId === params.applicationId) {
          target = app;
          break;
        }
      }

      if (!target) {
        return { success: false, message: "Application not found." };
      }

      if (target.status !== "PENDING") {
        return {
          success: false,
          message: `Application has already been processed (Current status: ${target.status}).`,
        };
      }

      target.status = "APPROVED";
      target.reviewedBy = params.reviewerId;
      target.reviewedAt = new Date();
      target.updatedAt = new Date();

      return {
        success: true,
        message: "Application approved successfully. Activation link dispatched.",
        rawActivationToken: rawToken,
        activationLink,
      };
    }
  }

  /**
   * Rejects an application with required reason and concurrency guard.
   */
  static async rejectApplication(params: {
    applicationId: string;
    reviewerId: string;
    rejectionReason: string;
  }): Promise<{ success: boolean; message: string }> {
    const reason = params.rejectionReason.trim();
    if (!reason || reason.length < 5) {
      return { success: false, message: "Please provide a valid rejection reason (min 5 chars)." };
    }

    if (await isDbConnected()) {
      try {
        await prisma.$transaction(async (tx) => {
          const app = await tx.application.findUnique({
            where: { id: params.applicationId },
          });

          if (!app) {
            throw new Error("Application not found.");
          }

          if (app.status !== "PENDING") {
            throw new Error(`Application has already been processed (Current status: ${app.status}).`);
          }

          const updated = await tx.application.update({
            where: { id: app.id },
            data: {
              status: "REJECTED",
              reviewedBy: params.reviewerId,
              reviewedAt: new Date(),
              rejectionReason: reason,
            },
          });

          await tx.auditLog.create({
            data: {
              userId: params.reviewerId,
              actorRole: "ADMIN",
              action: "APPLICATION_REJECTED",
              entity: "APPLICATION",
              entityId: updated.id,
              metadata: {
                referenceId: updated.referenceId,
                applicantEmail: updated.email,
                reason,
              },
            },
          });
        });

        return { success: true, message: "Application marked as rejected." };
      } catch (err) {
        return { success: false, message: (err as Error).message };
      }
    } else {
      let target: StoredApplication | undefined;
      for (const app of inMemoryApplications.values()) {
        if (app.id === params.applicationId || app.referenceId === params.applicationId) {
          target = app;
          break;
        }
      }

      if (!target) {
        return { success: false, message: "Application not found." };
      }

      if (target.status !== "PENDING") {
        return {
          success: false,
          message: `Application has already been processed (Current status: ${target.status}).`,
        };
      }

      target.status = "REJECTED";
      target.rejectionReason = reason;
      target.reviewedBy = params.reviewerId;
      target.reviewedAt = new Date();
      target.updatedAt = new Date();

      return { success: true, message: "Application marked as rejected." };
    }
  }
}
