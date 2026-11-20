import { describe, it, expect, beforeEach } from "vitest";
import { ApplicationService } from "@/services/application-service";
import { studentApplicationSchema, teacherApplicationSchema } from "@/schemas/application";

describe("Unit: Application Submission, Canonicalization & Duplicate Protection", () => {
  beforeEach(() => {
    ApplicationService._resetInMemory();
  });

  describe("Zod Validation Schemas", () => {
    it("should accept valid student application input", () => {
      const valid = studentApplicationSchema.safeParse({
        fullName: "Aarav Sharma",
        email: "aarav.sharma@dtu.ac.in",
        phone: "+919876543210",
        college: "Delhi Technological University",
        course: "B.Tech",
        branch: "Computer Science & Engineering",
        year: 3,
        rollNumber: "2K21/CO/104",
      });
      expect(valid.success).toBe(true);
    });

    it("should reject student application with invalid year or empty fields", () => {
      const invalid = studentApplicationSchema.safeParse({
        fullName: "A",
        email: "not-an-email",
        phone: "123",
        college: "",
        course: "",
        branch: "",
        year: 9,
        rollNumber: "",
      });
      expect(invalid.success).toBe(false);
    });

    it("should accept valid teacher application input", () => {
      const valid = teacherApplicationSchema.safeParse({
        fullName: "Dr. Sunita Rao",
        email: "s.rao@iitb.ac.in",
        phone: "+919876543211",
        institution: "IIT Bombay",
        designation: "Associate Professor",
        qualification: "Ph.D in AI & Robotics",
        department: "Computer Science",
        experienceYears: 12,
      });
      expect(valid.success).toBe(true);
    });
  });

  describe("Application Service Submission & Duplicate Protection", () => {
    it("should submit a student application and assign a unique GWS reference ID", async () => {
      const res = await ApplicationService.submitStudentApplication({
        fullName: "Rohan Verma",
        email: "rohan.verma@gmail.com",
        phone: "9876543210",
        college: "DTU",
        course: "B.Tech",
        branch: "IT",
        year: 2,
        rollNumber: "2K22/IT/045",
      });

      expect(res.success).toBe(true);
      expect(res.referenceId).toMatch(/^GWS-[2-9A-Z]{8}$/);
    });

    it("should prevent duplicate pending application with same canonical email", async () => {
      // First submission
      await ApplicationService.submitStudentApplication({
        fullName: "Rohan Verma",
        email: "rohan.verma@gmail.com",
        phone: "+919876543210",
        college: "DTU",
        course: "B.Tech",
        branch: "IT",
        year: 2,
        rollNumber: "2K22/IT/045",
      });

      // Second submission with dotted alias: rohan.v.erma@gmail.com
      const duplicateRes = await ApplicationService.submitStudentApplication({
        fullName: "Rohan Verma",
        email: "rohan.v.erma@gmail.com", // Canonicalizes to rohanverma@gmail.com
        phone: "+919876543299",
        college: "DTU",
        course: "B.Tech",
        branch: "IT",
        year: 2,
        rollNumber: "2K22/IT/046",
      });

      expect(duplicateRes.success).toBe(false);
      expect(duplicateRes.message).toMatch(/already under review/i);
    });

    it("should prevent duplicate application with same roll number at the same college", async () => {
      await ApplicationService.submitStudentApplication({
        fullName: "Student One",
        email: "student1@gmail.com",
        phone: "+919876543201",
        college: "Delhi Technological University",
        course: "B.Tech",
        branch: "CSE",
        year: 1,
        rollNumber: "2K23-CO-001",
      });

      // Same roll number with different punctuation: 2K23/CO/001
      const duplicateRes = await ApplicationService.submitStudentApplication({
        fullName: "Student Two",
        email: "student2@gmail.com",
        phone: "+919876543202",
        college: "Delhi Technological University",
        course: "B.Tech",
        branch: "CSE",
        year: 1,
        rollNumber: "2K23/CO/001",
      });

      expect(duplicateRes.success).toBe(false);
      expect(duplicateRes.message).toMatch(/already.*registered/i);
    });

    it("should successfully look up application status by Reference ID and Email", async () => {
      const created = await ApplicationService.submitTeacherApplication({
        fullName: "Prof. Vikram",
        email: "vikram@dtu.ac.in",
        phone: "+919876543222",
        institution: "DTU",
        designation: "Professor",
        qualification: "Ph.D",
        department: "ECE",
        experienceYears: 15,
      });

      expect(created.success).toBe(true);
      const refId = created.referenceId!;

      // Lookup with exact credentials
      const lookup = await ApplicationService.lookupStatus({
        referenceId: refId,
        email: "vikram@dtu.ac.in",
      });

      expect(lookup.success).toBe(true);
      expect(lookup.application?.fullName).toBe("Prof. Vikram");
      expect(lookup.application?.status).toBe("PENDING");

      // Lookup with wrong email fails
      const failedLookup = await ApplicationService.lookupStatus({
        referenceId: refId,
        email: "wrong@email.com",
      });
      expect(failedLookup.success).toBe(false);
    });
  });
});
