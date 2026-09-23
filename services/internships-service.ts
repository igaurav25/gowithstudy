import { prisma } from "@/lib/prisma";
import {
  ApplicationStatus,
  JobType,
  WorkMode,
  CreateInternshipInput,
  UpdateInternshipInput,
  InternshipFilterInput,
  APPLICATION_STATUSES,
} from "@/schemas/internships";

export interface InternshipApplicationItem {
  id: string;
  userId: string;
  company: string;
  role: string;
  jobType: JobType;
  workMode: WorkMode;
  location: string | null;
  jobUrl: string | null;
  stipendOrSalary: string | null;
  applicationDate: Date;
  deadline: Date | null;
  status: ApplicationStatus;
  referralName: string | null;
  resumeVersion: string | null;
  notes: string | null;
  recruiterContact: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InternshipStats {
  total: number;
  saved: number;
  applied: number;
  oaScheduled: number;
  interview: number;
  offer: number;
  rejected: number;
  inProgressCount: number;
  offerRate: number;
  upcomingOAsOrInterviews: {
    id: string;
    company: string;
    role: string;
    status: ApplicationStatus;
    notes: string | null;
  }[];
}

// In-memory store fallback
const mockInternshipStore = new Map<string, InternshipApplicationItem[]>();

function getInitialDemoApplications(userId: string): InternshipApplicationItem[] {
  const now = new Date();
  const pastDay = (daysAgo: number) =>
    new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  const futureDay = (daysAhead: number) =>
    new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  return [
    {
      id: "app_goog_1",
      userId,
      company: "Google",
      role: "SWE Summer Intern 2027",
      jobType: "INTERNSHIP",
      workMode: "HYBRID",
      location: "Bengaluru, KA",
      jobUrl: "https://careers.google.com/jobs/results/",
      stipendOrSalary: "₹1,15,000 / month",
      applicationDate: pastDay(20),
      deadline: futureDay(10),
      status: "INTERVIEW",
      referralName: "Alumni (L5 SWE)",
      resumeVersion: "CampusFlow_SWE_Resume_v3.pdf",
      notes: "Passed Round 1 DSA (Binary Trees & DFS). Scheduled for Technical Round 2 with Staff Engineer on Friday at 3:00 PM.",
      recruiterContact: "Pooja Roy (Google University Recruiting)",
      createdAt: pastDay(20),
      updatedAt: pastDay(2),
    },
    {
      id: "app_msft_2",
      userId,
      company: "Microsoft",
      role: "Explore / SWE Intern",
      jobType: "INTERNSHIP",
      workMode: "HYBRID",
      location: "Hyderabad, TS",
      jobUrl: "https://careers.microsoft.com/",
      stipendOrSalary: "₹1,00,000 / month",
      applicationDate: pastDay(15),
      deadline: futureDay(3),
      status: "OA_SCHEDULED",
      referralName: null,
      resumeVersion: "CampusFlow_SWE_Resume_v3.pdf",
      notes: "Codility Online Assessment link received. Test expires in 3 days. Focus on Dynamic Programming, Graphs and concurrency.",
      recruiterContact: "msft-campus@microsoft.com",
      createdAt: pastDay(15),
      updatedAt: pastDay(1),
    },
    {
      id: "app_amzn_3",
      userId,
      company: "Amazon",
      role: "Software Development Engineer Intern",
      jobType: "INTERNSHIP",
      workMode: "ON_SITE",
      location: "Bengaluru, KA",
      jobUrl: "https://amazon.jobs/en/",
      stipendOrSalary: "₹80,000 / month",
      applicationDate: pastDay(12),
      deadline: futureDay(14),
      status: "APPLIED",
      referralName: "Vikram Sen (Alumni - AWS)",
      resumeVersion: "CampusFlow_Backend_Resume.pdf",
      notes: "Referred by college senior at AWS. Application submitted for Summer 2027 batch under Student Programs portal.",
      recruiterContact: null,
      createdAt: pastDay(12),
      updatedAt: pastDay(12),
    },
    {
      id: "app_uber_4",
      userId,
      company: "Uber",
      role: "Backend Engineering Intern",
      jobType: "INTERNSHIP",
      workMode: "REMOTE",
      location: "Hyderabad / Remote",
      jobUrl: "https://www.uber.com/us/en/careers/",
      stipendOrSalary: "₹1,20,000 / month",
      applicationDate: pastDay(25),
      deadline: futureDay(7),
      status: "INTERVIEW",
      referralName: null,
      resumeVersion: "CampusFlow_SWE_Resume_v3.pdf",
      notes: "Round 2: System Design & Concurrency. Discussed LRU cache, distributed rate limiting algorithms and Redis caching.",
      recruiterContact: "tech-talent@uber.com",
      createdAt: pastDay(25),
      updatedAt: pastDay(3),
    },
    {
      id: "app_adbe_5",
      userId,
      company: "Adobe",
      role: "Research Intern - Media Data & AI",
      jobType: "RESEARCH_INTERN",
      workMode: "HYBRID",
      location: "Noida, UP",
      jobUrl: "https://adobe.wd5.myworkdayjobs.com/",
      stipendOrSalary: "₹75,000 / month",
      applicationDate: pastDay(2),
      deadline: futureDay(5),
      status: "SAVED",
      referralName: null,
      resumeVersion: "CampusFlow_AI_ML_Resume.pdf",
      notes: "Application deadline closes this Sunday. Prepare research portfolio, GitHub repo links, and CampusFlow RAG demo video.",
      recruiterContact: null,
      createdAt: pastDay(2),
      updatedAt: pastDay(2),
    },
    {
      id: "app_flpk_6",
      userId,
      company: "Flipkart",
      role: "SDE Intern (Pre-Placement Offer)",
      jobType: "INTERNSHIP",
      workMode: "ON_SITE",
      location: "Bengaluru, KA",
      jobUrl: "https://www.flipkartcareers.com/",
      stipendOrSalary: "₹1,00,000 / month",
      applicationDate: pastDay(40),
      deadline: pastDay(5),
      status: "OFFER",
      referralName: "On-Campus Drive",
      resumeVersion: "CampusFlow_SWE_Resume_v3.pdf",
      notes: "🎉 Official Offer Letter Received! 6-month intern leading to Full-Time PPO (28 LPA). Background check and onboarding forms completed.",
      recruiterContact: "campus-hiring@flipkart.com",
      createdAt: pastDay(40),
      updatedAt: pastDay(5),
    },
    {
      id: "app_atls_7",
      userId,
      company: "Atlassian",
      role: "Software Engineer Intern",
      jobType: "INTERNSHIP",
      workMode: "REMOTE",
      location: "Remote, India",
      jobUrl: "https://www.atlassian.com/company/careers",
      stipendOrSalary: "₹1,10,000 / month",
      applicationDate: pastDay(30),
      deadline: pastDay(10),
      status: "REJECTED",
      referralName: null,
      resumeVersion: "CampusFlow_SWE_Resume_v3.pdf",
      notes: "Completed HackerRank online assessment with 95% test cases passing. Position filled with internal return intern conversions.",
      recruiterContact: null,
      createdAt: pastDay(30),
      updatedAt: pastDay(10),
    },
    {
      id: "app_gs_8",
      userId,
      company: "Goldman Sachs",
      role: "Summer Analyst - Engineering",
      jobType: "INTERNSHIP",
      workMode: "ON_SITE",
      location: "Bengaluru, KA",
      jobUrl: "https://www.goldmansachs.com/careers/",
      stipendOrSalary: "₹90,000 / month",
      applicationDate: pastDay(8),
      deadline: futureDay(12),
      status: "APPLIED",
      referralName: null,
      resumeVersion: "CampusFlow_SWE_Resume_v3.pdf",
      notes: "Hackerrank Coding Assessment & Mathematics Section submitted. Awaiting shortlist for Superday rounds.",
      recruiterContact: "gs-campus@gs.com",
      createdAt: pastDay(8),
      updatedAt: pastDay(8),
    },
  ];
}

function getUserApplicationsList(userId: string): InternshipApplicationItem[] {
  let list = mockInternshipStore.get(userId);
  if (!list) {
    list = getInitialDemoApplications(userId);
    mockInternshipStore.set(userId, list);
  }
  return list;
}

export class InternshipsService {
  /**
   * Fetch all internship applications with multi-filter and search support
   */
  static async getApplications(
    userId: string,
    filters?: InternshipFilterInput
  ): Promise<InternshipApplicationItem[]> {
    try {
      const dbEntries = await prisma.internshipApplication.findMany({
        where: { userId },
        orderBy: { applicationDate: "desc" },
      });

      if (dbEntries && dbEntries.length > 0) {
        let list: InternshipApplicationItem[] = dbEntries.map((e) => ({
          ...e,
          jobType: (e as any).jobType || "INTERNSHIP",
          workMode: (e as any).workMode || "HYBRID",
          location: (e as any).location || null,
          stipendOrSalary: (e as any).stipendOrSalary || null,
          status: e.status as ApplicationStatus,
          referralName: (e as any).referralName || null,
          recruiterContact: (e as any).recruiterNote || null,
        }));
        return this.applyFilters(list, filters);
      }
    } catch {
      // In-memory fallback
    }

    const list = [...getUserApplicationsList(userId)];
    return this.applyFilters(list, filters);
  }

  private static applyFilters(
    list: InternshipApplicationItem[],
    filters?: InternshipFilterInput
  ): InternshipApplicationItem[] {
    let result = [...list];

    // Filter by query (company, role, notes, location)
    if (filters?.query && filters.query.trim()) {
      const q = filters.query.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.company.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q) ||
          (a.location && a.location.toLowerCase().includes(q)) ||
          (a.notes && a.notes.toLowerCase().includes(q))
      );
    }

    // Filter by status
    if (filters?.status && filters.status !== "ALL") {
      result = result.filter((a) => a.status === filters.status);
    }

    // Filter by jobType
    if (filters?.jobType && filters.jobType !== "ALL") {
      result = result.filter((a) => a.jobType === filters.jobType);
    }

    // Filter by workMode
    if (filters?.workMode && filters.workMode !== "ALL") {
      result = result.filter((a) => a.workMode === filters.workMode);
    }

    // Sorting
    const sortBy = filters?.sortBy || "applied_recent";
    result.sort((a, b) => {
      if (sortBy === "company") {
        return a.company.localeCompare(b.company);
      }
      if (sortBy === "deadline_soon") {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === "status") {
        const order: Record<ApplicationStatus, number> = {
          OFFER: 1,
          INTERVIEW: 2,
          OA_SCHEDULED: 3,
          APPLIED: 4,
          SAVED: 5,
          REJECTED: 6,
        };
        return (order[a.status] || 99) - (order[b.status] || 99);
      }
      // default: applied_recent
      return new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime();
    });

    return result;
  }

  /**
   * Get single application by ID
   */
  static async getApplicationById(
    id: string,
    userId: string
  ): Promise<InternshipApplicationItem | null> {
    const all = await this.getApplications(userId);
    return all.find((a) => a.id === id && a.userId === userId) || null;
  }

  /**
   * Create new internship/job application
   */
  static async createApplication(
    userId: string,
    input: CreateInternshipInput
  ): Promise<InternshipApplicationItem> {
    const newApp: InternshipApplicationItem = {
      id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      company: input.company,
      role: input.role,
      jobType: input.jobType || "INTERNSHIP",
      workMode: input.workMode || "HYBRID",
      location: input.location || null,
      jobUrl: input.jobUrl || null,
      stipendOrSalary: input.stipendOrSalary || null,
      applicationDate: input.applicationDate ? new Date(input.applicationDate) : new Date(),
      deadline: input.deadline ? new Date(input.deadline) : null,
      status: input.status || "APPLIED",
      referralName: input.referralName || null,
      resumeVersion: input.resumeVersion || null,
      notes: input.notes || null,
      recruiterContact: input.recruiterContact || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await prisma.internshipApplication.create({
        data: {
          id: newApp.id,
          userId,
          company: newApp.company,
          role: newApp.role,
          jobUrl: newApp.jobUrl,
          applicationDate: newApp.applicationDate,
          deadline: newApp.deadline,
          status: newApp.status,
          notes: newApp.notes,
          resumeVersion: newApp.resumeVersion,
          recruiterNote: newApp.recruiterContact,
        },
      });
      return newApp;
    } catch {
      const list = getUserApplicationsList(userId);
      list.unshift(newApp);
      mockInternshipStore.set(userId, list);
      return newApp;
    }
  }

  /**
   * Update application details
   */
  static async updateApplication(
    id: string,
    userId: string,
    input: UpdateInternshipInput
  ): Promise<InternshipApplicationItem> {
    try {
      await prisma.internshipApplication.update({
        where: { id },
        data: {
          ...(input.company !== undefined ? { company: input.company } : {}),
          ...(input.role !== undefined ? { role: input.role } : {}),
          ...(input.jobUrl !== undefined ? { jobUrl: input.jobUrl } : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
          ...(input.notes !== undefined ? { notes: input.notes } : {}),
          ...(input.resumeVersion !== undefined ? { resumeVersion: input.resumeVersion } : {}),
          ...(input.deadline !== undefined
            ? { deadline: input.deadline ? new Date(input.deadline) : null }
            : {}),
        },
      });
    } catch {
      // In-memory fallback
    }

    const list = getUserApplicationsList(userId);
    const index = list.findIndex((a) => a.id === id && a.userId === userId);
    if (index === -1) throw new Error("Application not found or unauthorized");

    const existing = list[index];
    const merged: InternshipApplicationItem = {
      ...existing,
      ...(input.company !== undefined ? { company: input.company } : {}),
      ...(input.role !== undefined ? { role: input.role } : {}),
      ...(input.jobType !== undefined ? { jobType: input.jobType } : {}),
      ...(input.workMode !== undefined ? { workMode: input.workMode } : {}),
      ...(input.location !== undefined ? { location: input.location } : {}),
      ...(input.jobUrl !== undefined ? { jobUrl: input.jobUrl } : {}),
      ...(input.stipendOrSalary !== undefined ? { stipendOrSalary: input.stipendOrSalary } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      ...(input.referralName !== undefined ? { referralName: input.referralName } : {}),
      ...(input.resumeVersion !== undefined ? { resumeVersion: input.resumeVersion } : {}),
      ...(input.recruiterContact !== undefined ? { recruiterContact: input.recruiterContact } : {}),
      ...(input.deadline !== undefined
        ? { deadline: input.deadline ? new Date(input.deadline) : null }
        : {}),
      updatedAt: new Date(),
    };

    list[index] = merged;
    mockInternshipStore.set(userId, list);
    return merged;
  }

  /**
   * Fast status transition (drag-and-drop or single-click status advance)
   */
  static async updateStatus(
    id: string,
    userId: string,
    status: ApplicationStatus
  ): Promise<InternshipApplicationItem> {
    return this.updateApplication(id, userId, { status });
  }

  /**
   * Delete application
   */
  static async deleteApplication(id: string, userId: string): Promise<boolean> {
    try {
      await prisma.internshipApplication.delete({
        where: { id },
      });
      return true;
    } catch {
      const list = getUserApplicationsList(userId);
      const index = list.findIndex((a) => a.id === id && a.userId === userId);
      if (index !== -1) {
        list.splice(index, 1);
        mockInternshipStore.set(userId, list);
        return true;
      }
      return false;
    }
  }

  /**
   * Aggregate statistics for KPIs and dashboard widgets
   */
  static async getInternshipStats(userId: string): Promise<InternshipStats> {
    const applications = await this.getApplications(userId);

    let saved = 0;
    let applied = 0;
    let oaScheduled = 0;
    let interview = 0;
    let offer = 0;
    let rejected = 0;

    for (const a of applications) {
      switch (a.status) {
        case "SAVED":
          saved++;
          break;
        case "APPLIED":
          applied++;
          break;
        case "OA_SCHEDULED":
          oaScheduled++;
          break;
        case "INTERVIEW":
          interview++;
          break;
        case "OFFER":
          offer++;
          break;
        case "REJECTED":
          rejected++;
          break;
      }
    }

    const inProgressCount = applied + oaScheduled + interview;
    const completedApplications = offer + rejected;
    const offerRate =
      completedApplications > 0
        ? Math.round((offer / completedApplications) * 100)
        : offer > 0
        ? 100
        : 0;

    const upcomingOAsOrInterviews = applications
      .filter((a) => a.status === "OA_SCHEDULED" || a.status === "INTERVIEW")
      .map((a) => ({
        id: a.id,
        company: a.company,
        role: a.role,
        status: a.status,
        notes: a.notes,
      }));

    return {
      total: applications.length,
      saved,
      applied,
      oaScheduled,
      interview,
      offer,
      rejected,
      inProgressCount,
      offerRate,
      upcomingOAsOrInterviews,
    };
  }
}
