import { describe, it, expect, beforeEach } from "vitest";
import { ApplicationService } from "@/services/application-service";

describe("Unit: Admin Application Approval & Concurrency Guards", () => {
  beforeEach(() => {
    ApplicationService._resetInMemory();
  });

  it("should approve a pending application and issue a 32-byte activation token", async () => {
    // 1. Submit an application
    const submitted = await ApplicationService.submitStudentApplication({
      fullName: "Ananya Roy",
      email: "ananya.roy@dtu.ac.in",
      phone: "+919876543233",
      college: "DTU",
      course: "B.Tech",
      branch: "CSE",
      year: 2,
      rollNumber: "2K22/CO/888",
    });

    expect(submitted.success).toBe(true);
    const refId = submitted.referenceId!;

    // 2. Admin approves the application
    const approval = await ApplicationService.approveApplication({
      applicationId: refId,
      reviewerId: "usr_admin_test_01",
    });

    expect(approval.success).toBe(true);
    expect(approval.rawActivationToken).toHaveLength(64); // 32 bytes in hex = 64 hex chars
    expect(approval.activationLink).toContain(`/activate?token=${approval.rawActivationToken}`);

    // Status should now be APPROVED
    const lookup = await ApplicationService.lookupStatus({
      referenceId: refId,
      email: "ananya.roy@dtu.ac.in",
    });
    expect(lookup.application?.status).toBe("APPROVED");
  });

  it("should prevent double-approval or re-processing of already approved applications (concurrency guard)", async () => {
    const submitted = await ApplicationService.submitStudentApplication({
      fullName: "Kavya Menon",
      email: "kavya.menon@dtu.ac.in",
      phone: "+919876543244",
      college: "DTU",
      course: "B.Tech",
      branch: "ECE",
      year: 3,
      rollNumber: "2K21/EC/101",
    });

    const refId = submitted.referenceId!;

    // First approval succeeds
    const firstApproval = await ApplicationService.approveApplication({
      applicationId: refId,
      reviewerId: "admin_1",
    });
    expect(firstApproval.success).toBe(true);

    // Second approval attempt MUST fail with clear message
    const secondApproval = await ApplicationService.approveApplication({
      applicationId: refId,
      reviewerId: "admin_2",
    });
    expect(secondApproval.success).toBe(false);
    expect(secondApproval.message).toMatch(/already.*processed/i);
  });

  it("should reject a pending application with minimum 5-character reason", async () => {
    const submitted = await ApplicationService.submitTeacherApplication({
      fullName: "Test Applicant",
      email: "fake@unverified.org",
      phone: "+919876543255",
      institution: "Unrecognized Institution",
      designation: "Lecturer",
      qualification: "B.Sc",
      department: "Maths",
      experienceYears: 1,
    });

    const refId = submitted.referenceId!;

    // Attempt rejection with too short reason
    const shortReason = await ApplicationService.rejectApplication({
      applicationId: refId,
      reviewerId: "admin_1",
      rejectionReason: "No",
    });
    expect(shortReason.success).toBe(false);

    // Valid rejection
    const validReject = await ApplicationService.rejectApplication({
      applicationId: refId,
      reviewerId: "admin_1",
      rejectionReason: "Institution is not accredited on state educational directory.",
    });
    expect(validReject.success).toBe(true);

    const lookup = await ApplicationService.lookupStatus({
      referenceId: refId,
      email: "fake@unverified.org",
    });
    expect(lookup.application?.status).toBe("REJECTED");
    expect(lookup.application?.rejectionReason).toContain("not accredited");
  });
});
