import { prisma } from "@/lib/prisma";
import {
  CreateJoinRequestInput,
  CreateProjectInput,
  JoinRequestStatus,
  ProjectFilterInput,
  ProjectStatus,
  ProjectType,
  UpdateProjectInput,
} from "@/schemas/projects";

export interface ProjectMemberItem {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  avatar: string | null;
  role: string;
  joinedAt: Date;
}

export interface ProjectJoinRequestItem {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  avatar: string | null;
  branch: string | null;
  roleApplied: string;
  message: string;
  portfolioOrGithub: string | null;
  skills: string[];
  status: JoinRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectItem {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar: string | null;
  ownerBranch: string | null;
  title: string;
  description: string;
  projectType: ProjectType;
  techStack: string[];
  requiredSkills: string[];
  targetTeamSize: number;
  currentTeamSize: number;
  rolesNeeded: string[];
  status: ProjectStatus;
  deadline: Date | null;
  githubUrl: string | null;
  contactInfo: string | null;
  createdAt: Date;
  updatedAt: Date;
  members: ProjectMemberItem[];
  joinRequests?: ProjectJoinRequestItem[];
  isOwner?: boolean;
  hasApplied?: boolean;
}

export interface ProjectStats {
  totalProjects: number;
  recruitingCount: number;
  openRolesCount: number;
  hackathonTeams: number;
  myApplicationsCount: number;
  typeCounts: Record<ProjectType, number>;
}

// In-memory demo store
let mockProjects: ProjectItem[] = [];
let mockJoinRequests: ProjectJoinRequestItem[] = [];

function initializeDemoData() {
  if (mockProjects.length > 0) return;

  const now = new Date();
  const pastDays = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
  const futureDays = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

  mockProjects = [
    {
      id: "proj_sih_1",
      ownerId: "user_senior_1",
      ownerName: "Aarav Sharma",
      ownerAvatar: null,
      ownerBranch: "B.Tech CSE '25 • Google SWE Intern",
      title: "Smart India Hackathon 2026: Multi-Agent Campus Library & Lab Reservation System",
      description: `We are participating in Smart India Hackathon (SIH 2026) under the Smart Education & Campus Automation theme.
We are building an autonomous agentic room reservation system where students can book study pods, lab equipment, and meeting rooms via natural language or Slack/WhatsApp bots.

Current Stack:
- Next.js 15 App Router + Tailwind CSS (Interactive Calendar & 3D Floorplan)
- Python FastAPI + LangGraph / Gemini API (Multi-agent scheduling & conflict resolution)
- PostgreSQL + Redis (Real-time distributed room locks & session cache)

We already have the backend core architecture ready and need 2 passionate teammates to round out our 4-person team.`,
      projectType: "HACKATHON",
      techStack: ["Next.js", "FastAPI", "Python", "Gemini API", "PostgreSQL", "Redis"],
      requiredSkills: ["React / Next.js", "Python / Asyncio", "REST APIs", "Tailwind CSS"],
      targetTeamSize: 4,
      currentTeamSize: 2,
      rolesNeeded: ["Frontend UI/UX Developer (Next.js)", "Agentic Backend / AI Engineer"],
      status: "RECRUITING",
      deadline: futureDays(18),
      githubUrl: "https://github.com/campusflow/sih-2026-agentic-campus",
      contactInfo: "Discord: @aarav_sih #8821 or Telegram @aarav_cse",
      createdAt: pastDays(4),
      updatedAt: pastDays(1),
      members: [
        {
          id: "mem_1",
          projectId: "proj_sih_1",
          userId: "user_senior_1",
          name: "Aarav Sharma",
          avatar: null,
          role: "Team Lead & Backend Architect",
          joinedAt: pastDays(4),
        },
        {
          id: "mem_2",
          projectId: "proj_sih_1",
          userId: "user_student_10",
          name: "Kavita Rao",
          avatar: null,
          role: "Frontend Engineer",
          joinedAt: pastDays(2),
        },
      ],
    },
    {
      id: "proj_capstone_2",
      ownerId: "user_senior_4",
      ownerName: "Vikram Nair",
      ownerAvatar: null,
      ownerBranch: "B.Tech IT '25",
      title: "Edge Computer Vision for Automated Campus Parking & EV Charging (B.Tech Final Year Capstone)",
      description: `Our final year capstone project is an edge computing setup using Raspberry Pi 5 + Coral TPU deployed across academic parking lots to detect open parking slots, recognize college vehicle stickers, and manage smart solar EV charging schedules.

We have hardware test units ready in CS Lab 304 and 3 active members. Looking for 1 embedded systems / IoT developer to finalize MQTT broker communication and OpenCV pipeline tuning.`,
      projectType: "CAPSTONE",
      techStack: ["Python", "YOLOv8", "OpenCV", "Raspberry Pi", "React", "MQTT"],
      requiredSkills: ["Computer Vision (YOLO/OpenCV)", "Python", "Embedded Linux", "IoT"],
      targetTeamSize: 4,
      currentTeamSize: 3,
      rolesNeeded: ["Embedded IoT Specialist", "Computer Vision Specialist"],
      status: "RECRUITING",
      deadline: futureDays(45),
      githubUrl: "https://github.com/campusflow/edge-vision-parking",
      contactInfo: "Email: vikram.nair@campusflow.edu",
      createdAt: pastDays(6),
      updatedAt: pastDays(2),
      members: [
        {
          id: "mem_3",
          projectId: "proj_capstone_2",
          userId: "user_senior_4",
          name: "Vikram Nair",
          avatar: null,
          role: "Lead Hardware & Vision",
          joinedAt: pastDays(6),
        },
        {
          id: "mem_4",
          projectId: "proj_capstone_2",
          userId: "user_student_16",
          name: "Pooja Reddy",
          avatar: null,
          role: "ML & Dataset Pipeline",
          joinedAt: pastDays(5),
        },
        {
          id: "mem_5",
          projectId: "proj_capstone_2",
          userId: "user_student_12",
          name: "Aditya Verma",
          avatar: null,
          role: "Cloud Dashboard & Telemetry",
          joinedAt: pastDays(4),
        },
      ],
    },
    {
      id: "proj_oss_3",
      ownerId: "user_cp_6",
      ownerName: "Devansh Mehta",
      ownerAvatar: null,
      ownerBranch: "B.Tech CSE '26 • Codeforces CM",
      title: "OpenSource Peer Code Review CLI Tool for College Git Repositories",
      description: `A fast terminal-based peer code review CLI written in Rust. It pulls pull requests, highlights AST diffs, runs local linters (clang-tidy, rustfmt, eslint), and creates formatted feedback markdown directly from the terminal.

We currently have 200+ stars on GitHub and need 1 contributor to help build terminal TUI screens with Ratatui and write integration test suites.`,
      projectType: "OPEN_SOURCE",
      techStack: ["Rust", "Ratatui", "TypeScript", "GitHub API", "Docker"],
      requiredSkills: ["Rust", "CLI Tooling", "Git Workflow", "Systems Programming"],
      targetTeamSize: 3,
      currentTeamSize: 2,
      rolesNeeded: ["Rust Systems Developer", "Documentation & Testing Lead"],
      status: "IN_PROGRESS",
      deadline: null,
      githubUrl: "https://github.com/campusflow/git-review-cli",
      contactInfo: "devansh@codecraft.org",
      createdAt: pastDays(10),
      updatedAt: pastDays(3),
      members: [
        {
          id: "mem_6",
          projectId: "proj_oss_3",
          userId: "user_cp_6",
          name: "Devansh Mehta",
          avatar: null,
          role: "Maintainer & Core Engine",
          joinedAt: pastDays(10),
        },
        {
          id: "mem_7",
          projectId: "proj_oss_3",
          userId: "user_student_3",
          name: "Sneha Patel",
          avatar: null,
          role: "CLI & Integrations",
          joinedAt: pastDays(7),
        },
      ],
    },
    {
      id: "proj_research_4",
      ownerId: "user_student_3",
      ownerName: "Sneha Patel",
      ownerAvatar: null,
      ownerBranch: "B.Tech CSE '27",
      title: "AI Medical Diagnostic Research Assistant (LLM Retrieval on PubMed & ClinicalTrials)",
      description: `Working with our college biomedical research faculty to build a factual, citation-grounded RAG tool for analyzing rare disease clinical trials and pharmacological drug interactions.

Looking for a co-researcher to help with dataset normalization, embedding evaluation (BEIR benchmark), and vector search latency tuning.`,
      projectType: "RESEARCH",
      techStack: ["Python", "PyTorch", "Milvus", "Next.js", "HuggingFace"],
      requiredSkills: ["PyTorch / Transformers", "Vector Databases", "Information Retrieval", "Python"],
      targetTeamSize: 3,
      currentTeamSize: 1,
      rolesNeeded: ["NLP / RAG Researcher", "Full Stack Dashboard Developer"],
      status: "RECRUITING",
      deadline: futureDays(60),
      githubUrl: null,
      contactInfo: "Discord: @sneha_ml",
      createdAt: pastDays(3),
      updatedAt: pastDays(3),
      members: [
        {
          id: "mem_8",
          projectId: "proj_research_4",
          userId: "user_student_3",
          name: "Sneha Patel",
          avatar: null,
          role: "Lead Researcher",
          joinedAt: pastDays(3),
        },
      ],
    },
    {
      id: "proj_startup_5",
      ownerId: "user_student_2",
      ownerName: "Rohan Verma",
      ownerAvatar: null,
      ownerBranch: "B.Tech CSE '26",
      title: "Campus Food Delivery & Mess Queue Wait-Time Optimizer (Campus Startup)",
      description: `Solving the 25-minute lunch rush line across college cafeterias and food courts. We are building a mobile pre-order app with queue time forecasting and locker-based pickup.

We have agreement from 4 campus cafeterias for a pilot trial next semester. Looking for a talented React Native developer and a student growth lead.`,
      projectType: "STARTUP",
      techStack: ["React Native", "Node.js", "Supabase", "Redis", "TypeScript"],
      requiredSkills: ["React Native / Expo", "Node.js / Express", "Realtime WebSockets"],
      targetTeamSize: 5,
      currentTeamSize: 2,
      rolesNeeded: ["Mobile App Developer (React Native)", "Growth & Marketing Lead"],
      status: "RECRUITING",
      deadline: futureDays(30),
      githubUrl: "https://github.com/campusflow/quick-bite-campus",
      contactInfo: "WhatsApp: +91 98765 43210",
      createdAt: pastDays(5),
      updatedAt: pastDays(2),
      members: [
        {
          id: "mem_9",
          projectId: "proj_startup_5",
          userId: "user_student_2",
          name: "Rohan Verma",
          avatar: null,
          role: "Founder & Backend",
          joinedAt: pastDays(5),
        },
        {
          id: "mem_10",
          projectId: "proj_startup_5",
          userId: "user_gate_5",
          name: "Ananya Iyer",
          avatar: null,
          role: "Operations & Partnerships",
          joinedAt: pastDays(3),
        },
      ],
    },
  ];

  mockJoinRequests = [
    {
      id: "req_demo_1",
      projectId: "proj_sih_1",
      userId: "user_student_15",
      name: "Manish Kumar",
      avatar: null,
      branch: "B.Tech CSE '27",
      roleApplied: "Frontend UI/UX Developer (Next.js)",
      message: "Hey Aarav! I built two hackathon frontends with Next.js App Router, Tailwind, and Framer Motion. I can create the floorplan reservation UI and responsive calendar.",
      portfolioOrGithub: "https://github.com/manish-dev",
      skills: ["Next.js", "Tailwind CSS", "TypeScript", "Framer Motion"],
      status: "PENDING",
      createdAt: pastDays(1),
      updatedAt: pastDays(1),
    },
  ];
}

export class ProjectsService {
  /**
   * Fetch all projects with multi-criteria filtering and search
   */
  static async getProjects(
    filters?: ProjectFilterInput,
    currentUserId?: string
  ): Promise<ProjectItem[]> {
    initializeDemoData();

    try {
      const dbProjects = await prisma.project.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          members: true,
          joinRequests: true,
        },
      });

      if (dbProjects && dbProjects.length > 0) {
        const list: ProjectItem[] = dbProjects.map((p) => {
          const isOwner = currentUserId ? p.ownerId === currentUserId : false;
          const hasApplied = currentUserId
            ? p.joinRequests.some((r) => r.userId === currentUserId)
            : false;

          return {
            id: p.id,
            ownerId: p.ownerId,
            ownerName: p.ownerName,
            ownerAvatar: p.ownerAvatar,
            ownerBranch: p.ownerBranch,
            title: p.title,
            description: p.description,
            projectType: p.projectType as ProjectType,
            techStack: p.techStack,
            requiredSkills: p.requiredSkills,
            targetTeamSize: p.targetTeamSize,
            currentTeamSize: p.members.length,
            rolesNeeded: p.rolesNeeded,
            status: p.status as ProjectStatus,
            deadline: p.deadline,
            githubUrl: p.githubUrl,
            contactInfo: p.contactInfo,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            isOwner,
            hasApplied,
            members: p.members.map((m) => ({
              id: m.id,
              projectId: m.projectId,
              userId: m.userId,
              name: m.name,
              avatar: m.avatar,
              role: m.role,
              joinedAt: m.joinedAt,
            })),
            joinRequests: p.joinRequests.map((r) => ({
              id: r.id,
              projectId: r.projectId,
              userId: r.userId,
              name: r.name,
              avatar: r.avatar,
              branch: r.branch,
              roleApplied: r.roleApplied,
              message: r.message,
              portfolioOrGithub: r.portfolioOrGithub,
              skills: [],
              status: r.status as JoinRequestStatus,
              createdAt: r.createdAt,
              updatedAt: r.updatedAt,
            })),
          };
        });

        return this.applyFilters(list, filters);
      }
    } catch {
      // In-memory fallback
    }

    const list = mockProjects.map((p) => {
      const isOwner = currentUserId ? p.ownerId === currentUserId : false;
      const projectReqs = mockJoinRequests.filter((r) => r.projectId === p.id);
      const hasApplied = currentUserId
        ? projectReqs.some((r) => r.userId === currentUserId)
        : false;

      return {
        ...p,
        currentTeamSize: p.members.length,
        isOwner,
        hasApplied,
        joinRequests: projectReqs,
      };
    });

    return this.applyFilters(list, filters);
  }

  private static applyFilters(
    list: ProjectItem[],
    filters?: ProjectFilterInput
  ): ProjectItem[] {
    let result = [...list];

    // Filter by type
    if (filters?.projectType && filters.projectType !== "ALL") {
      result = result.filter((p) => p.projectType === filters.projectType);
    }

    // Filter by status
    if (filters?.status && filters.status !== "ALL") {
      result = result.filter((p) => p.status === filters.status);
    }

    // Filter by tech
    if (filters?.tech && filters.tech.trim()) {
      const t = filters.tech.toLowerCase().trim();
      result = result.filter((p) =>
        p.techStack.some((tech) => tech.toLowerCase().includes(t))
      );
    }

    // Search query across title, description, skills, roles
    if (filters?.query && filters.query.trim()) {
      const q = filters.query.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.ownerName.toLowerCase().includes(q) ||
          p.rolesNeeded.some((r) => r.toLowerCase().includes(q)) ||
          p.techStack.some((tech) => tech.toLowerCase().includes(q))
      );
    }

    // Sort
    const sortBy = filters?.sortBy || "recent";
    result.sort((a, b) => {
      if (sortBy === "spots_open") {
        const spotsA = a.targetTeamSize - a.currentTeamSize;
        const spotsB = b.targetTeamSize - b.currentTeamSize;
        return spotsB - spotsA;
      }
      if (sortBy === "team_size") {
        return b.targetTeamSize - a.targetTeamSize;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }

  /**
   * Get single project by ID
   */
  static async getProjectById(
    id: string,
    currentUserId?: string
  ): Promise<ProjectItem | null> {
    initializeDemoData();

    try {
      const dbProject = await prisma.project.findUnique({
        where: { id },
        include: {
          members: true,
          joinRequests: {
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (dbProject) {
        const isOwner = currentUserId ? dbProject.ownerId === currentUserId : false;
        const hasApplied = currentUserId
          ? dbProject.joinRequests.some((r) => r.userId === currentUserId)
          : false;

        return {
          id: dbProject.id,
          ownerId: dbProject.ownerId,
          ownerName: dbProject.ownerName,
          ownerAvatar: dbProject.ownerAvatar,
          ownerBranch: dbProject.ownerBranch,
          title: dbProject.title,
          description: dbProject.description,
          projectType: dbProject.projectType as ProjectType,
          techStack: dbProject.techStack,
          requiredSkills: dbProject.requiredSkills,
          targetTeamSize: dbProject.targetTeamSize,
          currentTeamSize: dbProject.members.length,
          rolesNeeded: dbProject.rolesNeeded,
          status: dbProject.status as ProjectStatus,
          deadline: dbProject.deadline,
          githubUrl: dbProject.githubUrl,
          contactInfo: dbProject.contactInfo,
          createdAt: dbProject.createdAt,
          updatedAt: dbProject.updatedAt,
          isOwner,
          hasApplied,
          members: dbProject.members.map((m) => ({
            id: m.id,
            projectId: m.projectId,
            userId: m.userId,
            name: m.name,
            avatar: m.avatar,
            role: m.role,
            joinedAt: m.joinedAt,
          })),
          joinRequests: dbProject.joinRequests.map((r) => ({
            id: r.id,
            projectId: r.projectId,
            userId: r.userId,
            name: r.name,
            avatar: r.avatar,
            branch: r.branch,
            roleApplied: r.roleApplied,
            message: r.message,
            portfolioOrGithub: r.portfolioOrGithub,
            skills: [],
            status: r.status as JoinRequestStatus,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
          })),
        };
      }
    } catch {
      // In-memory fallback
    }

    const p = mockProjects.find((item) => item.id === id);
    if (!p) return null;

    const isOwner = currentUserId ? p.ownerId === currentUserId : false;
    const projectReqs = mockJoinRequests.filter((r) => r.projectId === id);
    const hasApplied = currentUserId
      ? projectReqs.some((r) => r.userId === currentUserId)
      : false;

    return {
      ...p,
      currentTeamSize: p.members.length,
      isOwner,
      hasApplied,
      joinRequests: projectReqs,
    };
  }

  /**
   * Create a new project listing
   */
  static async createProject(
    userId: string,
    ownerDetails: { name: string; avatarUrl?: string | null; branch?: string | null },
    input: CreateProjectInput
  ): Promise<ProjectItem> {
    initializeDemoData();

    const newId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newProject: ProjectItem = {
      id: newId,
      ownerId: userId,
      ownerName: ownerDetails.name,
      ownerAvatar: ownerDetails.avatarUrl || null,
      ownerBranch: ownerDetails.branch || "B.Tech CSE",
      title: input.title.trim(),
      description: input.description.trim(),
      projectType: input.projectType,
      techStack: input.techStack.map((s) => s.trim()),
      requiredSkills: input.requiredSkills.map((s) => s.trim()),
      targetTeamSize: input.targetTeamSize,
      currentTeamSize: 1,
      rolesNeeded: input.rolesNeeded.map((r) => r.trim()),
      status: input.status || "RECRUITING",
      deadline: input.deadline ? new Date(input.deadline) : null,
      githubUrl: input.githubUrl || null,
      contactInfo: input.contactInfo || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      members: [
        {
          id: `mem_${Date.now()}`,
          projectId: newId,
          userId,
          name: ownerDetails.name,
          avatar: ownerDetails.avatarUrl || null,
          role: "Team Lead & Project Owner",
          joinedAt: new Date(),
        },
      ],
      joinRequests: [],
      isOwner: true,
      hasApplied: false,
    };

    try {
      await prisma.project.create({
        data: {
          id: newProject.id,
          ownerId: userId,
          ownerName: newProject.ownerName,
          ownerAvatar: newProject.ownerAvatar,
          ownerBranch: newProject.ownerBranch,
          title: newProject.title,
          description: newProject.description,
          projectType: newProject.projectType,
          techStack: newProject.techStack,
          requiredSkills: newProject.requiredSkills,
          targetTeamSize: newProject.targetTeamSize,
          currentTeamSize: 1,
          rolesNeeded: newProject.rolesNeeded,
          status: newProject.status,
          deadline: newProject.deadline,
          githubUrl: newProject.githubUrl,
          contactInfo: newProject.contactInfo,
          members: {
            create: {
              userId,
              name: ownerDetails.name,
              avatar: ownerDetails.avatarUrl || null,
              role: "Team Lead & Project Owner",
            },
          },
        },
      });
      return newProject;
    } catch {
      mockProjects.unshift(newProject);
      return newProject;
    }
  }

  /**
   * Update project details (Owner only)
   */
  static async updateProject(
    id: string,
    userId: string,
    input: UpdateProjectInput
  ): Promise<ProjectItem> {
    initializeDemoData();

    try {
      const existing = await prisma.project.findUnique({ where: { id } });
      if (existing && existing.ownerId !== userId) {
        throw new Error("Unauthorized: Only the project owner can edit this listing");
      }

      await prisma.project.update({
        where: { id },
        data: {
          ...(input.title ? { title: input.title } : {}),
          ...(input.description ? { description: input.description } : {}),
          ...(input.projectType ? { projectType: input.projectType } : {}),
          ...(input.techStack ? { techStack: input.techStack } : {}),
          ...(input.requiredSkills ? { requiredSkills: input.requiredSkills } : {}),
          ...(input.targetTeamSize ? { targetTeamSize: input.targetTeamSize } : {}),
          ...(input.rolesNeeded ? { rolesNeeded: input.rolesNeeded } : {}),
          ...(input.status ? { status: input.status } : {}),
          ...(input.deadline !== undefined
            ? { deadline: input.deadline ? new Date(input.deadline) : null }
            : {}),
          ...(input.githubUrl !== undefined ? { githubUrl: input.githubUrl } : {}),
          ...(input.contactInfo !== undefined ? { contactInfo: input.contactInfo } : {}),
        },
      });
    } catch {
      // In-memory fallback
    }

    const index = mockProjects.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Project not found");
    if (mockProjects[index].ownerId !== userId) {
      throw new Error("Unauthorized: Only the project owner can edit this listing");
    }

    const updated: ProjectItem = {
      ...mockProjects[index],
      ...(input.title ? { title: input.title } : {}),
      ...(input.description ? { description: input.description } : {}),
      ...(input.projectType ? { projectType: input.projectType } : {}),
      ...(input.techStack ? { techStack: input.techStack } : {}),
      ...(input.requiredSkills ? { requiredSkills: input.requiredSkills } : {}),
      ...(input.targetTeamSize ? { targetTeamSize: input.targetTeamSize } : {}),
      ...(input.rolesNeeded ? { rolesNeeded: input.rolesNeeded } : {}),
      ...(input.status ? { status: input.status } : {}),
      ...(input.deadline !== undefined
        ? { deadline: input.deadline ? new Date(input.deadline) : null }
        : {}),
      ...(input.githubUrl !== undefined ? { githubUrl: input.githubUrl } : {}),
      ...(input.contactInfo !== undefined ? { contactInfo: input.contactInfo } : {}),
      updatedAt: new Date(),
    };

    mockProjects[index] = updated;
    return updated;
  }

  /**
   * Delete project (Owner or Admin)
   */
  static async deleteProject(
    id: string,
    userId: string,
    userRole: string = "USER"
  ): Promise<boolean> {
    initializeDemoData();

    try {
      const existing = await prisma.project.findUnique({ where: { id } });
      if (existing) {
        if (existing.ownerId !== userId && userRole !== "ADMIN" && userRole !== "MODERATOR") {
          throw new Error("Unauthorized: Only the owner or an admin can delete this project");
        }
        await prisma.project.delete({ where: { id } });
        return true;
      }
    } catch {
      // In-memory fallback
    }

    const index = mockProjects.findIndex((p) => p.id === id);
    if (index !== -1) {
      const p = mockProjects[index];
      if (p.ownerId !== userId && userRole !== "ADMIN" && userRole !== "MODERATOR") {
        throw new Error("Unauthorized: Only the owner or an admin can delete this project");
      }
      mockProjects.splice(index, 1);
      mockJoinRequests = mockJoinRequests.filter((r) => r.projectId !== id);
      return true;
    }

    return false;
  }

  /**
   * Apply / send join request to a project
   */
  static async sendJoinRequest(
    userId: string,
    applicantDetails: { name: string; avatarUrl?: string | null; branch?: string | null },
    input: CreateJoinRequestInput
  ): Promise<ProjectJoinRequestItem> {
    initializeDemoData();

    const existingReq = mockJoinRequests.find(
      (r) => r.projectId === input.projectId && r.userId === userId
    );
    if (existingReq) {
      throw new Error("You have already applied to join this project");
    }

    const project = mockProjects.find((p) => p.id === input.projectId);
    if (project && project.ownerId === userId) {
      throw new Error("You cannot apply to join your own project");
    }

    const newReq: ProjectJoinRequestItem = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      projectId: input.projectId,
      userId,
      name: applicantDetails.name,
      avatar: applicantDetails.avatarUrl || null,
      branch: applicantDetails.branch || "Verified Student",
      roleApplied: input.roleApplied,
      message: input.message.trim(),
      portfolioOrGithub: input.portfolioOrGithub || null,
      skills: input.skills || [],
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await prisma.projectJoinRequest.create({
        data: {
          id: newReq.id,
          projectId: newReq.projectId,
          userId,
          name: newReq.name,
          avatar: newReq.avatar,
          branch: newReq.branch,
          roleApplied: newReq.roleApplied,
          message: newReq.message,
          portfolioOrGithub: newReq.portfolioOrGithub,
          status: "PENDING",
        },
      });
      return newReq;
    } catch {
      mockJoinRequests.push(newReq);
      return newReq;
    }
  }

  /**
   * Accept or Reject a join request (Owner only)
   */
  static async respondJoinRequest(
    requestId: string,
    ownerId: string,
    status: "ACCEPTED" | "REJECTED"
  ): Promise<boolean> {
    initializeDemoData();

    try {
      const dbReq = await prisma.projectJoinRequest.findUnique({
        where: { id: requestId },
        include: { project: true },
      });

      if (dbReq) {
        if (dbReq.project.ownerId !== ownerId) {
          throw new Error("Unauthorized: Only the project owner can review applications");
        }

        await prisma.projectJoinRequest.update({
          where: { id: requestId },
          data: { status },
        });

        if (status === "ACCEPTED") {
          await prisma.projectMember.create({
            data: {
              projectId: dbReq.projectId,
              userId: dbReq.userId,
              name: dbReq.name,
              avatar: dbReq.avatar,
              role: dbReq.roleApplied,
            },
          });
          await prisma.project.update({
            where: { id: dbReq.projectId },
            data: { currentTeamSize: { increment: 1 } },
          });
        }
        return true;
      }
    } catch {
      // In-memory fallback
    }

    const reqIndex = mockJoinRequests.findIndex((r) => r.id === requestId);
    if (reqIndex === -1) throw new Error("Join request not found");

    const req = mockJoinRequests[reqIndex];
    const project = mockProjects.find((p) => p.id === req.projectId);
    if (!project) throw new Error("Project not found");
    if (project.ownerId !== ownerId) {
      throw new Error("Unauthorized: Only the project owner can review applications");
    }

    req.status = status;
    req.updatedAt = new Date();

    if (status === "ACCEPTED") {
      const alreadyMember = project.members.some((m) => m.userId === req.userId);
      if (!alreadyMember) {
        project.members.push({
          id: `mem_${Date.now()}`,
          projectId: project.id,
          userId: req.userId,
          name: req.name,
          avatar: req.avatar,
          role: req.roleApplied,
          joinedAt: new Date(),
        });
        project.currentTeamSize = project.members.length;
        if (project.currentTeamSize >= project.targetTeamSize) {
          project.status = "IN_PROGRESS";
        }
      }
    }

    return true;
  }

  /**
   * Get projects owned or joined by the student
   */
  static async getMyProjects(userId: string): Promise<{
    owned: ProjectItem[];
    joined: ProjectItem[];
    applied: { project: ProjectItem; request: ProjectJoinRequestItem }[];
  }> {
    initializeDemoData();
    const all = await this.getProjects(undefined, userId);

    const owned = all.filter((p) => p.ownerId === userId);
    const joined = all.filter(
      (p) => p.ownerId !== userId && p.members.some((m) => m.userId === userId)
    );

    const myRequests = mockJoinRequests.filter((r) => r.userId === userId);
    const applied = myRequests
      .map((req) => {
        const project = all.find((p) => p.id === req.projectId);
        return project ? { project, request: req } : null;
      })
      .filter(Boolean) as { project: ProjectItem; request: ProjectJoinRequestItem }[];

    return { owned, joined, applied };
  }

  /**
   * Aggregate statistics for projects dashboard
   */
  static async getProjectStats(currentUserId?: string): Promise<ProjectStats> {
    initializeDemoData();

    const typeCounts: Record<ProjectType, number> = {
      HACKATHON: 0,
      CAPSTONE: 0,
      OPEN_SOURCE: 0,
      RESEARCH: 0,
      STARTUP: 0,
      PRACTICE: 0,
    };

    let recruitingCount = 0;
    let openRolesCount = 0;
    let hackathonTeams = 0;

    for (const p of mockProjects) {
      typeCounts[p.projectType] = (typeCounts[p.projectType] || 0) + 1;
      if (p.status === "RECRUITING") {
        recruitingCount++;
        openRolesCount += Math.max(0, p.targetTeamSize - p.members.length);
      }
      if (p.projectType === "HACKATHON") {
        hackathonTeams++;
      }
    }

    const myApplicationsCount = currentUserId
      ? mockJoinRequests.filter((r) => r.userId === currentUserId).length
      : 2;

    return {
      totalProjects: mockProjects.length,
      recruitingCount,
      openRolesCount,
      hackathonTeams,
      myApplicationsCount,
      typeCounts,
    };
  }
}
