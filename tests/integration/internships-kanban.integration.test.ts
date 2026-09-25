import { describe, it, expect } from "vitest";
import { InternshipsService } from "@/services/internships-service";

describe("Integration: Internship & Job Application Kanban Pipeline", () => {
  const studentA = "usr_student_jobs_01";
  const studentB = "usr_student_jobs_02";

  let createdAppId = "";

  it("Step 1: Should log a new internship application in SAVED state", async () => {
    const app = await InternshipsService.createApplication(studentA, {
      company: "Google",
      role: "Software Engineering Intern - Summer 2027",
      jobType: "INTERNSHIP",
      workMode: "HYBRID",
      location: "Bengaluru, KA",
      jobUrl: "https://careers.google.com/jobs/results/",
      stipendOrSalary: "₹1,25,000 / month",
      status: "SAVED",
      notes: "Referral requested from alum. Resume tailored for Distributed Systems.",
      resumeVersion: "CampusFlow_SWE_Resume_v3.pdf",
    });

    expect(app.id).toBeDefined();
    expect(app.company).toBe("Google");
    expect(app.status).toBe("SAVED");
    expect(app.userId).toBe(studentA);

    createdAppId = app.id;
  });

  it("Step 2: Should advance application along Kanban stages (SAVED -> APPLIED -> INTERVIEW -> OFFER)", async () => {
    // Stage 1: APPLIED
    const applied = await InternshipsService.updateApplication(createdAppId, studentA, {
      status: "APPLIED",
    });
    expect(applied.status).toBe("APPLIED");

    // Stage 2: INTERVIEW
    const interview = await InternshipsService.updateApplication(createdAppId, studentA, {
      status: "INTERVIEW",
      notes: "Technical phone screen scheduled with senior SWE.",
    });
    expect(interview.status).toBe("INTERVIEW");
    expect(interview.notes).toContain("Technical phone screen");

    // Stage 3: OFFER
    const offer = await InternshipsService.updateApplication(createdAppId, studentA, {
      status: "OFFER",
      notes: "Official offer letter received! 12-week summer cohort.",
    });
    expect(offer.status).toBe("OFFER");
  });

  it("Step 3: Should prevent unauthorized student from modifying another student's application (IDOR Defense)", async () => {
    await expect(
      InternshipsService.updateApplication(createdAppId, studentB, {
        status: "REJECTED",
      })
    ).rejects.toThrow(/Application not found or unauthorized/);
  });

  it("Step 4: Should filter applications by search query and status", async () => {
    const googleApps = await InternshipsService.getApplications(studentA, {
      query: "Google",
    });
    expect(googleApps.length).toBeGreaterThan(0);
    expect(googleApps[0].id).toBe(createdAppId);

    const offerApps = await InternshipsService.getApplications(studentA, {
      status: "OFFER",
    });
    expect(offerApps.some((a) => a.id === createdAppId)).toBe(true);

    const rejectedApps = await InternshipsService.getApplications(studentA, {
      status: "REJECTED",
    });
    expect(rejectedApps.some((a) => a.id === createdAppId)).toBe(false);
  });

  it("Step 5: Should compute aggregate pipeline statistics", async () => {
    const stats = await InternshipsService.getInternshipStats(studentA);

    expect(stats.total).toBeGreaterThan(0);
    expect(stats.offer).toBeGreaterThanOrEqual(1);
    expect(stats.offerRate).toBeGreaterThanOrEqual(0);
    expect(stats.offerRate).toBeLessThanOrEqual(100);
  });

  it("Step 6: Student B cannot delete Student A's application; Student A can delete it", async () => {
    const intruderDelete = await InternshipsService.deleteApplication(createdAppId, studentB);
    expect(intruderDelete).toBe(false);

    const ownerDelete = await InternshipsService.deleteApplication(createdAppId, studentA);
    expect(ownerDelete).toBe(true);

    const afterDelete = await InternshipsService.getApplications(studentA);
    expect(afterDelete.some((a) => a.id === createdAppId)).toBe(false);
  });
});
