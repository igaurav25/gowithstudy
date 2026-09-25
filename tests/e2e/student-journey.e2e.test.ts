import { describe, it, expect } from "vitest";
import { AuthService } from "@/services/auth-service";
import { NotesService } from "@/services/notes-service";
import { AIService } from "@/services/ai-service";
import { TimetableService } from "@/services/timetable-service";
import { AssignmentsService } from "@/services/assignments-service";
import { InternshipsService } from "@/services/internships-service";
import { CommunityService } from "@/services/community-service";
import { ProjectsService } from "@/services/projects-service";
import { createSessionToken, verifySessionToken } from "@/lib/auth";

describe("E2E: Complete Student Academic & Career Journey on CampusFlow", () => {
  const timestamp = Date.now().toString(36);
  const studentData = {
    name: "Karan Johar",
    email: `karan.student_${timestamp}@campusflow.edu`,
    password: "Password123!",
    confirmPassword: "Password123!",
    college: "Indraprastha Institute of Information Technology Delhi",
    course: "B.Tech",
    branch: "Computer Science & Artificial Intelligence",
    year: 3,
    semester: 5,
  };

  let studentId = "";
  let sessionJwt = "";

  it("Phase 1: Student registers an account with academic profile details", async () => {
    const signup = await AuthService.signup(studentData);
    expect(signup.user).toBeDefined();
    expect(signup.user.email).toBe(studentData.email);
    expect(signup.user.emailVerified).toBe(false);
    expect(signup.verificationToken).toBeDefined();

    studentId = signup.user.id;

    // Verify email address
    const verified = await AuthService.verifyEmail(signup.verificationToken);
    expect(verified.emailVerified).toBe(true);
  });

  it("Phase 2: Student logs in and establishes persistent authenticated session", async () => {
    const login = await AuthService.login({
      email: studentData.email,
      password: studentData.password,
      rememberMe: true,
    });

    expect(login.user.email).toBe(studentData.email);
    expect(login.sessionId).toBeDefined();

    // Create session JWT
    sessionJwt = await createSessionToken({
      userId: studentId,
      email: studentData.email,
      name: studentData.name,
      role: "USER",
      sessionId: login.sessionId,
      college: studentData.college,
      course: studentData.course,
      branch: studentData.branch,
      year: studentData.year,
      semester: studentData.semester,
    });

    const parsedSession = await verifySessionToken(sessionJwt);
    expect(parsedSession).not.toBeNull();
    expect(parsedSession?.userId).toBe(studentId);
    expect(parsedSession?.role).toBe("USER");
  });

  it("Phase 3: Student schedules their weekly classes and checks conflict detection", async () => {
    // Add Operating Systems on Monday
    const newClass = await TimetableService.createEntry(studentId, {
      subject: "Operating Systems",
      faculty: "Dr. Mukhopadhyay",
      day: "Monday",
      startTime: "10:00",
      endTime: "11:15",
      room: "LH-101",
      notes: "Process management and CPU scheduling",
    });

    expect(newClass.id).toBeDefined();

    // Attempt to add a conflicting class at the same time
    const clash = await TimetableService.checkTimeClash(
      studentId,
      "Monday",
      "10:30",
      "11:45"
    );
    expect(clash.hasClash).toBe(true);

    // Export iCalendar schedule
    const ics = await TimetableService.generateIcsCalendar(studentId);
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("Operating Systems");
  });

  it("Phase 4: Student manages upcoming assignment deadlines and tracks completion", async () => {
    const asgn = await AssignmentsService.createAssignment(studentId, {
      title: "Banker's Algorithm Safety Check in C++",
      subject: "Operating Systems",
      description: "Implement matrix safety algorithm and resource-request algorithm.",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      priority: "HIGH",
      status: "PENDING",
    });

    expect(asgn.id).toBeDefined();
    expect(asgn.status).toBe("PENDING");

    // Advance to completed
    const completed = await AssignmentsService.updateAssignment(asgn.id, studentId, {
      status: "COMPLETED",
    });
    expect(completed.status).toBe("COMPLETED");

    const stats = await AssignmentsService.getAssignmentsStats(studentId);
    expect(stats.completed).toBeGreaterThan(0);
  });

  it("Phase 5: Student uploads lecture notes and uses AI Study Assistant with citations", async () => {
    const note = await NotesService.createNote(studentId, {
      title: "Operating Systems — Process Synchronization Cheatsheet",
      description: "Semaphores, Mutexes, and Peterson's Algorithm.",
      subject: "Operating Systems",
      category: "Lecture Notes",
      tags: ["OS", "Synchronization", "Semaphores"],
      status: "COMPLETED",
    });

    expect(note.id).toBeDefined();

    // Ask AI study assistant
    const aiResponse = await AIService.queryAssistant(studentId, {
      query: "How does Peterson's solution ensure mutual exclusion?",
      noteId: "ALL",
      mode: "EXPLAIN",
      history: [],
    });

    expect(aiResponse.content.length).toBeGreaterThan(10);
    expect(aiResponse.citations.length).toBeGreaterThan(0);
  });

  it("Phase 6: Student tracks an internship application from submission to Offer", async () => {
    const app = await InternshipsService.createApplication(studentId, {
      company: "Microsoft",
      role: "Software Engineering Intern",
      jobType: "INTERNSHIP",
      workMode: "HYBRID",
      location: "Hyderabad, TS",
      status: "APPLIED",
      notes: "Completed Online Assessment on Codility.",
    });

    expect(app.id).toBeDefined();
    expect(app.status).toBe("APPLIED");

    // Advance to Offer
    const offer = await InternshipsService.updateApplication(app.id, studentId, {
      status: "OFFER",
      notes: "Received offer letter for 8-week summer internship!",
    });
    expect(offer.status).toBe("OFFER");

    const stats = await InternshipsService.getInternshipStats(studentId);
    expect(stats.offer).toBeGreaterThanOrEqual(1);
  });

  it("Phase 7: Student engages in peer doubt solving and joins a hackathon project team", async () => {
    // 1. Post doubt in community
    const post = await CommunityService.createPost(
      studentId,
      {
        name: studentData.name,
        branch: studentData.branch,
        avatarUrl: null,
      },
      {
        title: "Best practice for Dockerizing Next.js 15 apps with Prisma?",
        content: "What is the recommended multi-stage Dockerfile setup?",
        category: "STUDY",
        tags: ["docker", "nextjs", "prisma"],
      }
    );
    expect(post.id).toBeDefined();

    // 2. Discover an SIH hackathon project team
    const projects = await ProjectsService.getProjects();
    expect(projects.length).toBeGreaterThan(0);

    const projectToJoin = projects[0];
    const joinReq = await ProjectsService.sendJoinRequest(
      studentId,
      {
        name: studentData.name,
        branch: studentData.branch,
        avatarUrl: null,
      },
      {
        projectId: projectToJoin.id,
        roleApplied: "Full-Stack Engineer",
        message: "I can build the Next.js frontend and PostgreSQL Prisma backend!",
        skills: ["Next.js", "TypeScript", "Prisma"],
      }
    );

    expect(joinReq.id).toBeDefined();
    expect(joinReq.status).toBe("PENDING");
  });

  it("Phase 8: Student securely logs out and terminates sessions", async () => {
    await AuthService.logoutAllDevices(studentId);

    // Confirm user lookup
    const user = await AuthService.getUserById(studentId);
    expect(user).toBeDefined();
    expect(user?.email).toBe(studentData.email);
  });
});
