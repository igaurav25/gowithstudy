import { prisma } from "@/lib/prisma";
import {
  CollegeInfoCategory,
  VerificationState,
  CreateCollegeInfoInput,
  UpdateCollegeInfoInput,
  CollegeInfoFilterInput,
} from "@/schemas/college-info";

export interface CollegeItem {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  websiteUrl: string | null;
  verifiedDomains: string[];
  departments: string[];
  totalNotices?: number;
}

export interface CollegeNoticeItem {
  id: string;
  collegeId: string;
  collegeCode: string;
  collegeName: string;
  category: CollegeInfoCategory;
  title: string;
  content: string;
  refNumber: string | null;
  officialDocUrl: string | null;
  verifiedState: VerificationState;
  verifiedBy: string | null;
  verifiedAt: string | null;
  creatorId: string;
  creatorName: string;
  creatorRole: string;
  department: string | null;
  validUntil: string | null;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CollegeStats {
  totalVerified: number;
  activeCirculars: number;
  examSchedules: number;
  departmentGuidelines: number;
}

// Default Seed Colleges
export const DEFAULT_COLLEGES: CollegeItem[] = [
  {
    id: "col_dtu_01",
    code: "DTU",
    name: "Delhi Technological University",
    city: "New Delhi",
    state: "Delhi",
    websiteUrl: "https://dtu.ac.in",
    verifiedDomains: ["dtu.ac.in", "delhi.ac.in"],
    departments: [
      "Computer Science & Engineering",
      "Information Technology",
      "Software Engineering",
      "Electronics & Communication Engineering",
      "Electrical Engineering",
      "Mechanical Engineering",
      "Mathematics & Computing",
    ],
  },
  {
    id: "col_iitb_02",
    code: "IITB",
    name: "Indian Institute of Technology Bombay",
    city: "Mumbai",
    state: "Maharashtra",
    websiteUrl: "https://iitb.ac.in",
    verifiedDomains: ["iitb.ac.in"],
    departments: [
      "Computer Science & Engineering",
      "Electrical Engineering",
      "Mechanical Engineering",
      "Aerospace Engineering",
      "Data Science & AI",
    ],
  },
  {
    id: "col_bitsp_03",
    code: "BITSP",
    name: "Birla Institute of Technology and Science, Pilani",
    city: "Pilani",
    state: "Rajasthan",
    websiteUrl: "https://www.bits-pilani.ac.in",
    verifiedDomains: ["pilani.bits-pilani.ac.in", "bits-pilani.ac.in"],
    departments: [
      "Computer Science",
      "Electrical & Electronics",
      "Mechanical Engineering",
      "Chemical Engineering",
    ],
  },
  {
    id: "col_nitt_04",
    code: "NITT",
    name: "National Institute of Technology, Tiruchirappalli",
    city: "Tiruchirappalli",
    state: "Tamil Nadu",
    websiteUrl: "https://www.nitt.edu",
    verifiedDomains: ["nitt.edu"],
    departments: [
      "Computer Science & Engineering",
      "Instrumentation & Control",
      "ECE",
      "Mechanical Engineering",
    ],
  },
];

// In-Memory Seed Circulars
let inMemoryNotices: CollegeNoticeItem[] = [
  {
    id: "ci_dtu_01",
    collegeId: "col_dtu_01",
    collegeCode: "DTU",
    collegeName: "Delhi Technological University",
    category: "EXAM_SCHEDULE",
    title: "End-Term Theory & Practical Examination Schedule — Even Semester 2026 (B.Tech CSE/IT/SE)",
    content:
      "All students of B.Tech 4th, 6th, and 8th semester (CSE, IT, SE) are hereby informed that the End-Term Even Semester 2026 Theory Examinations will commence from May 18, 2026. Practical examinations and capstone viva-voce will be conducted from May 04 to May 14, 2026. Strict adherence to the university hall ticket rules is mandatory.",
    refNumber: "DTU/COE/2026/0412",
    officialDocUrl: "https://dtu.ac.in/circulars/exam-timetable-even-2026.pdf",
    verifiedState: "VERIFIED",
    verifiedBy: "Controller of Examinations, DTU",
    verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    creatorId: "usr_admin_01",
    creatorName: "Prof. R.K. Sharma (Dean Academics)",
    creatorRole: "ADMIN",
    department: "Computer Science & Engineering",
    validUntil: "2026-06-05T23:59:59Z",
    isPinned: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "ci_dtu_02",
    collegeId: "col_dtu_01",
    collegeCode: "DTU",
    collegeName: "Delhi Technological University",
    category: "ACADEMIC",
    title: "B.Tech CSE Revised Curriculum Ordinance (NEP 2020 Framework) — Elective Basket & Credit Policy",
    content:
      "The Academic Council in its 48th meeting has approved the revised curriculum scheme for B.Tech Computer Science & Engineering. Key amendments include the addition of 'Generative AI & LLM Systems' and 'Cloud Native Architecture' as 7th semester Program Electives. Minimum credit requirement for Honors degree specified as 182 credits.",
    refNumber: "DTU/Acad/Ord/2026/09",
    officialDocUrl: "https://dtu.ac.in/academic/cse-curriculum-nep2020.pdf",
    verifiedState: "VERIFIED",
    verifiedBy: "Dean of Academic Affairs, DTU",
    verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    creatorId: "usr_admin_01",
    creatorName: "Prof. R.K. Sharma (Dean Academics)",
    creatorRole: "ADMIN",
    department: "Computer Science & Engineering",
    validUntil: null,
    isPinned: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: "ci_dtu_03",
    collegeId: "col_dtu_01",
    collegeCode: "DTU",
    collegeName: "Delhi Technological University",
    category: "FEE_DEADLINE",
    title: "Merit-cum-Means & DTU Fee Concession Scheme 2026 — Online Application Deadline",
    content:
      "Applications are invited from eligible undergraduate students for DTU Merit-cum-Means financial assistance and Tuition Fee Waiver. Annual parental income must not exceed INR 4.5 LPA. Required documents: Income Certificate issued by SDM, Marksheet of preceding year, and Nationalized Bank Passbook copy. Portal closes May 15, 2026 at 23:59 hrs.",
    refNumber: "DTU/DSW/2026/FEE-18",
    officialDocUrl: "https://dtu.ac.in/welfare/scholarship-form-2026.pdf",
    verifiedState: "VERIFIED",
    verifiedBy: "Dean of Student Welfare (DSW), DTU",
    verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    creatorId: "usr_admin_01",
    creatorName: "Dean Student Welfare Office",
    creatorRole: "ADMIN",
    department: "All Departments",
    validUntil: "2026-05-15T23:59:59Z",
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
  },
  {
    id: "ci_dtu_04",
    collegeId: "col_dtu_01",
    collegeCode: "DTU",
    collegeName: "Delhi Technological University",
    category: "DEPARTMENT_RESOURCE",
    title: "Final Year Major Capstone Project (CO-402) Evaluation Rubrics & IEEE Paper Guidelines",
    content:
      "All 8th-semester B.Tech CSE project groups must submit their Final Project Report along with the Plagiarism Certificate (< 10% similarity via Turnitin) and proof of IEEE/Scopus indexed conference paper submission by April 30, 2026. Viva-voce panels will be chaired by external examiners from IIT Delhi and Industry Leaders.",
    refNumber: "DTU/HOD-CSE/2026/CAP-03",
    officialDocUrl: "https://dtu.ac.in/departments/cse/capstone-guidelines-2026.pdf",
    verifiedState: "VERIFIED",
    verifiedBy: "Head of Department (CSE), DTU",
    verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    creatorId: "usr_mod_01",
    creatorName: "Dr. A. Verma (CSE Moderation Panel)",
    creatorRole: "MODERATOR",
    department: "Computer Science & Engineering",
    validUntil: "2026-05-01T23:59:59Z",
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
  {
    id: "ci_dtu_05",
    collegeId: "col_dtu_01",
    collegeCode: "DTU",
    collegeName: "Delhi Technological University",
    category: "CAMPUS_FACILITY",
    title: "High Performance Computing (HPC) & Param Cluster GPU Node Access Protocol for Students",
    content:
      "B.Tech & M.Tech research scholars requiring access to NVIDIA A100 GPU clusters for Deep Learning and Model Fine-tuning must submit an SSH public key and project brief approved by their faculty supervisor. Workstation slots are available in CC-302 with 24x7 remote VPN tunneling.",
    refNumber: "DTU/CC/2026/HPC-77",
    officialDocUrl: "https://dtu.ac.in/facilities/hpc-ssh-access-request.pdf",
    verifiedState: "VERIFIED",
    verifiedBy: "Director, Computer Centre, DTU",
    verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    creatorId: "usr_admin_01",
    creatorName: "Computer Centre Administration",
    creatorRole: "ADMIN",
    department: "Computer Science & Engineering",
    validUntil: null,
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
  },
  {
    id: "ci_dtu_06",
    collegeId: "col_dtu_01",
    collegeCode: "DTU",
    collegeName: "Delhi Technological University",
    category: "CIRCULAR",
    title: "Special Academic Duty Leave (OD) for Participants of Invictus 2026 & Smart India Hackathon",
    content:
      "Students representing DTU in official university technical symposiums, hackathons, and ACM ICPC regionals will be granted Duty Leaves upon recommendation by the faculty coordinator. Students must submit participation certificates to the academic section within 7 working days.",
    refNumber: "DTU/Acad/Cir/2026/89",
    officialDocUrl: null,
    verifiedState: "VERIFIED",
    verifiedBy: "Associate Dean (Academics-UG), DTU",
    verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    creatorId: "usr_admin_01",
    creatorName: "Prof. R.K. Sharma (Dean Academics)",
    creatorRole: "ADMIN",
    department: "All Departments",
    validUntil: null,
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
  },
  // IITB circulars
  {
    id: "ci_iitb_01",
    collegeId: "col_iitb_02",
    collegeCode: "IITB",
    collegeName: "Indian Institute of Technology Bombay",
    category: "EXAM_SCHEDULE",
    title: "IITB Autumn & Spring Semesters Slot Timetable & Final Assessment Calendar 2026",
    content:
      "The Senate has approved the Examination Schedule for all B.Tech / Dual Degree students. Strict adherence to institute honor code during in-person proctored testing will be supervised by invigilation squads.",
    refNumber: "IITB/Acad/Exam/2026/11",
    officialDocUrl: "https://iitb.ac.in/academic/exam-calendar-2026.pdf",
    verifiedState: "VERIFIED",
    verifiedBy: "Dean of Academic Programmes, IIT Bombay",
    verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    creatorId: "usr_admin_01",
    creatorName: "IITB Academic Office",
    creatorRole: "ADMIN",
    department: "Computer Science & Engineering",
    validUntil: "2026-05-30T23:59:59Z",
    isPinned: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  // BITS circulars
  {
    id: "ci_bitsp_01",
    collegeId: "col_bitsp_03",
    collegeCode: "BITSP",
    collegeName: "Birla Institute of Technology and Science, Pilani",
    category: "CIRCULAR",
    title: "Practice School (PS-II) Allotment Rounds & Semester 2 Registration Notification",
    content:
      "All students enrolled in the Practice School II program for the upcoming term must submit station preferences via the ERP portal. Verify CGPA eligibility cutoff for leading software & quant organizations.",
    refNumber: "BITS/PS-D/2026/04",
    officialDocUrl: "https://bits-pilani.ac.in/psd/allotment-guidelines.pdf",
    verifiedState: "VERIFIED",
    verifiedBy: "Dean, Practice School Division, BITS Pilani",
    verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    creatorId: "usr_admin_01",
    creatorName: "BITS PSD Directorate",
    creatorRole: "ADMIN",
    department: "Computer Science",
    validUntil: null,
    isPinned: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  // NIT Trichy circulars
  {
    id: "ci_nitt_01",
    collegeId: "col_nitt_04",
    collegeCode: "NITT",
    collegeName: "National Institute of Technology, Tiruchirappalli",
    category: "ACADEMIC",
    title: "Regulations for B.Tech Minor Degree in AI & Machine Learning — Even Sem 2026",
    content:
      "Students possessing CGPA 7.5 and above with no standing backlogs can register for Minor Specialization in AI/ML offered by the Department of Computer Science & Engineering. Allotted maximum 60 seats.",
    refNumber: "NITT/DeanAP/2026/Minor-02",
    officialDocUrl: "https://nitt.edu/academic/regulations-minor-ai.pdf",
    verifiedState: "VERIFIED",
    verifiedBy: "Dean (Academic), NIT Trichy",
    verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    creatorId: "usr_admin_01",
    creatorName: "NIT Trichy Academic Section",
    creatorRole: "ADMIN",
    department: "Computer Science & Engineering",
    validUntil: null,
    isPinned: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
  },
];

export class CollegeInfoService {
  /**
   * Get all registered colleges with notice counts
   */
  static async getColleges(): Promise<CollegeItem[]> {
    try {
      if ((prisma as any).college) {
        const colleges = await (prisma as any).college.findMany({
          orderBy: { name: "asc" },
          include: {
            _count: {
              select: { informationItems: true },
            },
          },
        });

        if (colleges && colleges.length > 0) {
          return colleges.map((c: any) => ({
            id: c.id,
            code: c.code,
            name: c.name,
            city: c.city,
            state: c.state,
            websiteUrl: c.websiteUrl,
            verifiedDomains: c.verifiedDomains || [],
            departments: c.departments || [],
            totalNotices: c._count?.informationItems || 0,
          }));
        }
      }
    } catch {
      // Fallback to in-memory seed list
    }

    return DEFAULT_COLLEGES.map((c) => ({
      ...c,
      totalNotices: inMemoryNotices.filter((n) => n.collegeCode === c.code).length,
    }));
  }

  /**
   * Get specific college details by code (e.g. DTU, IITB)
   */
  static async getCollegeByCode(code: string): Promise<CollegeItem | null> {
    const normalized = (code || "DTU").toUpperCase().trim();
    try {
      if ((prisma as any).college) {
        const col = await (prisma as any).college.findUnique({
          where: { code: normalized },
        });
        if (col) {
          return {
            id: col.id,
            code: col.code,
            name: col.name,
            city: col.city,
            state: col.state,
            websiteUrl: col.websiteUrl,
            verifiedDomains: col.verifiedDomains || [],
            departments: col.departments || [],
          };
        }
      }
    } catch {
      // fallback
    }

    const found = DEFAULT_COLLEGES.find((c) => c.code === normalized);
    return found || DEFAULT_COLLEGES[0];
  }

  /**
   * Query notices for a college with comprehensive filtering
   */
  static async getCollegeInfo(filter: CollegeInfoFilterInput): Promise<CollegeNoticeItem[]> {
    const targetCode = (filter.collegeCode || "DTU").toUpperCase().trim();

    try {
      if ((prisma as any).collegeInformation) {
        const whereClause: any = {
          college: { code: targetCode },
        };

        if (filter.category && filter.category !== "ALL") {
          whereClause.category = filter.category;
        }

        if (filter.department && filter.department !== "ALL") {
          whereClause.department = filter.department;
        }

        if (filter.verifiedOnly) {
          whereClause.verifiedState = "VERIFIED";
        }

        if (filter.query && filter.query.trim()) {
          const q = filter.query.trim();
          whereClause.OR = [
            { title: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } },
            { refNumber: { contains: q, mode: "insensitive" } },
          ];
        }

        const items = await (prisma as any).collegeInformation.findMany({
          where: whereClause,
          orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
          include: {
            college: true,
            creator: {
              include: { profile: true },
            },
          },
        });

        if (items && items.length > 0) {
          return items.map((i: any) => ({
            id: i.id,
            collegeId: i.collegeId,
            collegeCode: i.college.code,
            collegeName: i.college.name,
            category: i.category as CollegeInfoCategory,
            title: i.title,
            content: i.content,
            refNumber: i.refNumber,
            officialDocUrl: i.officialDocUrl,
            verifiedState: i.verifiedState as VerificationState,
            verifiedBy: i.verifiedBy,
            verifiedAt: i.verifiedAt ? i.verifiedAt.toISOString() : null,
            creatorId: i.creatorId,
            creatorName: i.creator?.profile?.name || i.creator?.email || "Academic Staff",
            creatorRole: i.creator?.role || "MODERATOR",
            department: i.department,
            validUntil: i.validUntil ? i.validUntil.toISOString() : null,
            isPinned: i.isPinned,
            createdAt: i.createdAt.toISOString(),
            updatedAt: i.updatedAt.toISOString(),
          }));
        }
      }
    } catch {
      // Fallback to in-memory filter
    }

    let results = inMemoryNotices.filter((n) => n.collegeCode === targetCode);

    if (filter.category && filter.category !== "ALL") {
      results = results.filter((n) => n.category === filter.category);
    }

    if (filter.department && filter.department !== "ALL") {
      results = results.filter((n) => n.department === filter.department);
    }

    if (filter.verifiedOnly) {
      results = results.filter((n) => n.verifiedState === "VERIFIED");
    }

    if (filter.query && filter.query.trim()) {
      const q = filter.query.toLowerCase().trim();
      results = results.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          (n.refNumber && n.refNumber.toLowerCase().includes(q))
      );
    }

    // Sort pinned first, then newest
    return results.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  /**
   * Get single circular/notice by ID
   */
  static async getCollegeInfoById(id: string): Promise<CollegeNoticeItem | null> {
    try {
      if ((prisma as any).collegeInformation) {
        const item = await (prisma as any).collegeInformation.findUnique({
          where: { id },
          include: {
            college: true,
            creator: {
              include: { profile: true },
            },
          },
        });
        if (item) {
          return {
            id: item.id,
            collegeId: item.collegeId,
            collegeCode: item.college.code,
            collegeName: item.college.name,
            category: item.category as CollegeInfoCategory,
            title: item.title,
            content: item.content,
            refNumber: item.refNumber,
            officialDocUrl: item.officialDocUrl,
            verifiedState: item.verifiedState as VerificationState,
            verifiedBy: item.verifiedBy,
            verifiedAt: item.verifiedAt ? item.verifiedAt.toISOString() : null,
            creatorId: item.creatorId,
            creatorName: item.creator?.profile?.name || item.creator?.email || "Academic Staff",
            creatorRole: item.creator?.role || "MODERATOR",
            department: item.department,
            validUntil: item.validUntil ? item.validUntil.toISOString() : null,
            isPinned: item.isPinned,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
          };
        }
      }
    } catch {
      // fallback
    }

    return inMemoryNotices.find((n) => n.id === id) || null;
  }

  /**
   * Publish a new verified notice (Requires MODERATOR or ADMIN)
   */
  static async createCollegeInfo(
    input: CreateCollegeInfoInput,
    authorId: string,
    authorName: string = "Official Authority",
    authorRole: string = "MODERATOR"
  ): Promise<CollegeNoticeItem> {
    const targetCode = input.collegeCode.toUpperCase().trim();
    const college = (await this.getCollegeByCode(targetCode)) || DEFAULT_COLLEGES[0];

    const newItem: CollegeNoticeItem = {
      id: `ci_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      collegeId: college.id,
      collegeCode: college.code,
      collegeName: college.name,
      category: input.category,
      title: input.title.trim(),
      content: input.content.trim(),
      refNumber: input.refNumber ? input.refNumber.trim() : null,
      officialDocUrl: input.officialDocUrl ? input.officialDocUrl.trim() : null,
      verifiedState: "VERIFIED",
      verifiedBy: input.verifiedBy.trim(),
      verifiedAt: new Date().toISOString(),
      creatorId: authorId,
      creatorName: authorName,
      creatorRole: authorRole,
      department: input.department && input.department.trim() ? input.department.trim() : "All Departments",
      validUntil: input.validUntil ? new Date(input.validUntil).toISOString() : null,
      isPinned: Boolean(input.isPinned),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if ((prisma as any).collegeInformation) {
        let collegeRecord = await (prisma as any).college.findUnique({
          where: { code: targetCode },
        });

        if (!collegeRecord) {
          collegeRecord = await (prisma as any).college.create({
            data: {
              code: college.code,
              name: college.name,
              city: college.city,
              state: college.state,
              websiteUrl: college.websiteUrl,
              verifiedDomains: college.verifiedDomains,
              departments: college.departments,
            },
          });
        }

        const created = await (prisma as any).collegeInformation.create({
          data: {
            collegeId: collegeRecord.id,
            category: newItem.category,
            title: newItem.title,
            content: newItem.content,
            refNumber: newItem.refNumber,
            officialDocUrl: newItem.officialDocUrl,
            verifiedState: newItem.verifiedState,
            verifiedBy: newItem.verifiedBy,
            verifiedAt: new Date(),
            creatorId: authorId,
            department: newItem.department,
            validUntil: newItem.validUntil ? new Date(newItem.validUntil) : null,
            isPinned: newItem.isPinned,
          },
          include: {
            college: true,
            creator: {
              include: { profile: true },
            },
          },
        });

        if (created) {
          return {
            id: created.id,
            collegeId: created.collegeId,
            collegeCode: created.college.code,
            collegeName: created.college.name,
            category: created.category as CollegeInfoCategory,
            title: created.title,
            content: created.content,
            refNumber: created.refNumber,
            officialDocUrl: created.officialDocUrl,
            verifiedState: created.verifiedState as VerificationState,
            verifiedBy: created.verifiedBy,
            verifiedAt: created.verifiedAt ? created.verifiedAt.toISOString() : null,
            creatorId: created.creatorId,
            creatorName: created.creator?.profile?.name || authorName,
            creatorRole: created.creator?.role || authorRole,
            department: created.department,
            validUntil: created.validUntil ? created.validUntil.toISOString() : null,
            isPinned: created.isPinned,
            createdAt: created.createdAt.toISOString(),
            updatedAt: created.updatedAt.toISOString(),
          };
        }
      }
    } catch {
      // In-memory fallback
    }

    inMemoryNotices.unshift(newItem);
    return newItem;
  }

  /**
   * Update an existing college notice
   */
  static async updateCollegeInfo(
    input: UpdateCollegeInfoInput
  ): Promise<CollegeNoticeItem | null> {
    try {
      if ((prisma as any).collegeInformation) {
        const updated = await (prisma as any).collegeInformation.update({
          where: { id: input.id },
          data: {
            ...(input.title ? { title: input.title.trim() } : {}),
            ...(input.content ? { content: input.content.trim() } : {}),
            ...(input.category ? { category: input.category } : {}),
            ...(input.refNumber !== undefined ? { refNumber: input.refNumber || null } : {}),
            ...(input.officialDocUrl !== undefined ? { officialDocUrl: input.officialDocUrl || null } : {}),
            ...(input.verifiedState ? { verifiedState: input.verifiedState } : {}),
            ...(input.verifiedBy ? { verifiedBy: input.verifiedBy } : {}),
            ...(input.department !== undefined ? { department: input.department } : {}),
            ...(input.isPinned !== undefined ? { isPinned: input.isPinned } : {}),
          },
          include: {
            college: true,
            creator: {
              include: { profile: true },
            },
          },
        });

        if (updated) {
          return {
            id: updated.id,
            collegeId: updated.collegeId,
            collegeCode: updated.college.code,
            collegeName: updated.college.name,
            category: updated.category as CollegeInfoCategory,
            title: updated.title,
            content: updated.content,
            refNumber: updated.refNumber,
            officialDocUrl: updated.officialDocUrl,
            verifiedState: updated.verifiedState as VerificationState,
            verifiedBy: updated.verifiedBy,
            verifiedAt: updated.verifiedAt ? updated.verifiedAt.toISOString() : null,
            creatorId: updated.creatorId,
            creatorName: updated.creator?.profile?.name || "Official Authority",
            creatorRole: updated.creator?.role || "MODERATOR",
            department: updated.department,
            validUntil: updated.validUntil ? updated.validUntil.toISOString() : null,
            isPinned: updated.isPinned,
            createdAt: updated.createdAt.toISOString(),
            updatedAt: updated.updatedAt.toISOString(),
          };
        }
      }
    } catch {
      // fallback
    }

    const idx = inMemoryNotices.findIndex((n) => n.id === input.id);
    if (idx !== -1) {
      inMemoryNotices[idx] = {
        ...inMemoryNotices[idx],
        ...(input.title ? { title: input.title.trim() } : {}),
        ...(input.content ? { content: input.content.trim() } : {}),
        ...(input.category ? { category: input.category } : {}),
        ...(input.refNumber !== undefined ? { refNumber: input.refNumber || null } : {}),
        ...(input.officialDocUrl !== undefined ? { officialDocUrl: input.officialDocUrl || null } : {}),
        ...(input.verifiedState ? { verifiedState: input.verifiedState } : {}),
        ...(input.verifiedBy ? { verifiedBy: input.verifiedBy } : {}),
        ...(input.department !== undefined ? { department: input.department } : {}),
        ...(input.isPinned !== undefined ? { isPinned: input.isPinned } : {}),
        updatedAt: new Date().toISOString(),
      };
      return inMemoryNotices[idx];
    }

    return null;
  }

  /**
   * Delete or archive a notice
   */
  static async deleteCollegeInfo(id: string): Promise<boolean> {
    try {
      if ((prisma as any).collegeInformation) {
        await (prisma as any).collegeInformation.delete({
          where: { id },
        });
        return true;
      }
    } catch {
      // fallback
    }

    const initialLen = inMemoryNotices.length;
    inMemoryNotices = inMemoryNotices.filter((n) => n.id !== id);
    return inMemoryNotices.length < initialLen;
  }

  /**
   * Get college statistics for quick dashboard overview
   */
  static async getCollegeStats(collegeCode: string): Promise<CollegeStats> {
    const notices = await this.getCollegeInfo({ collegeCode });
    return {
      totalVerified: notices.filter((n) => n.verifiedState === "VERIFIED").length,
      activeCirculars: notices.filter((n) => n.category === "CIRCULAR").length,
      examSchedules: notices.filter((n) => n.category === "EXAM_SCHEDULE").length,
      departmentGuidelines: notices.filter((n) => n.category === "DEPARTMENT_RESOURCE" || n.category === "ACADEMIC").length,
    };
  }
}
