import { StoredUser, AuthService } from "@/services/auth-service";
import { ProfileService, StudentProfileData } from "@/services/profile-service";
import { NotesService } from "@/services/notes-service";
import { TimetableService } from "@/services/timetable-service";
import { AssignmentsService } from "@/services/assignments-service";

export interface ClassScheduleItem {
  id: string;
  subject: string;
  faculty: string;
  time: string;
  room: string;
  day: string;
  status: "UPCOMING" | "IN_PROGRESS" | "COMPLETED";
}

export interface UpcomingAssignmentItem {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  dueDays: number;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  completed: boolean;
}

export interface RecentNoteItem {
  id: string;
  title: string;
  subject: string;
  fileSize: string;
  uploadedAt: string;
  pages: number;
}

export interface StudentNotificationItem {
  id: string;
  title: string;
  description: string;
  type: "ASSIGNMENT" | "INTERVIEW" | "COMMUNITY" | "SYSTEM";
  timestamp: string;
  read: boolean;
}

export interface DashboardMetrics {
  greeting: string;
  student: StudentProfileData;
  attendanceRate: number;
  assignmentCompletionRate: number;
  studyStreakDays: number;
  dsaSolvedCount: number;
  dsaTotalCount: number;
  dsaCategories: { name: string; solved: number; total: number; pct: number }[];
  jobApplicationsCount: { applied: number; interview: number; offer: number };
  todayClasses: ClassScheduleItem[];
  upcomingAssignments: UpcomingAssignmentItem[];
  recentNotes: RecentNoteItem[];
  notifications: StudentNotificationItem[];
}

export const DashboardService = {
  /**
   * Generates a greeting based on the current hour.
   */
  getGreeting(name: string): string {
    const hour = new Date().getHours();
    if (hour < 12) return `Good morning, ${name}!`;
    if (hour < 18) return `Good afternoon, ${name}!`;
    return `Good evening, ${name}!`;
  },

  /**
   * Fetches all aggregated dashboard data for an authenticated student.
   */
  async getDashboardData(userId: string): Promise<DashboardMetrics | null> {
    const profile = await ProfileService.getProfile(userId);
    if (!profile) return null;

    // Fetch dynamic today's schedule from TimetableService
    const liveTodayClasses = await TimetableService.getTodayClasses(userId);
    const dynamicClasses: ClassScheduleItem[] = liveTodayClasses.map((c) => ({
      id: c.id,
      subject: c.subject,
      faculty: c.faculty || "Faculty",
      time: `${c.startTime} - ${c.endTime}`,
      room: c.room || "TBA",
      day: c.day,
      status: c.status || "UPCOMING",
    }));

    // Fetch dynamic assignments and stats from AssignmentsService
    const [userAssignments, assignmentStats] = await Promise.all([
      AssignmentsService.getAssignments(userId),
      AssignmentsService.getAssignmentsStats(userId),
    ]);

    const dynamicAssignments: UpcomingAssignmentItem[] = userAssignments
      .filter((a) => a.status !== "COMPLETED")
      .slice(0, 3)
      .map((a) => ({
        id: a.id,
        title: a.title,
        subject: a.subject,
        dueDate: a.dueLabel,
        dueDays: a.dueDays,
        priority: a.priority,
        completed: a.status === "COMPLETED",
      }));

    const userNotes = await NotesService.getNotes(userId, { isArchived: false, sortBy: "newest" });
    const dynamicRecentNotes: RecentNoteItem[] = userNotes.slice(0, 3).map((n) => ({
      id: n.id,
      title: n.fileName || `${n.title}.pdf`,
      subject: n.subject,
      fileSize: n.fileSize ? `${(n.fileSize / (1024 * 1024)).toFixed(1)} MB` : "PDF",
      uploadedAt: new Date(n.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      pages: Math.max(8, Math.round((n.fileSize || 2500000) / 120000)),
    }));

    const mockNotifications: StudentNotificationItem[] = [
      {
        id: "notif_1",
        title: "Assignment Due in 24 Hours",
        description: "DBMS B+ Tree Report is due tomorrow at 11:59 PM.",
        type: "ASSIGNMENT",
        timestamp: "10 mins ago",
        read: false,
      },
      {
        id: "notif_2",
        title: "Google SWE Intern OA Round",
        description: "Your Online Assessment invitation has been scheduled.",
        type: "INTERVIEW",
        timestamp: "2 hours ago",
        read: false,
      },
      {
        id: "notif_3",
        title: "New Hackathon Team Request",
        description: "Rohit requested to join your Smart Campus project team.",
        type: "COMMUNITY",
        timestamp: "Yesterday",
        read: true,
      },
    ];

    return {
      greeting: this.getGreeting(profile.name),
      student: profile,
      attendanceRate: 88,
      assignmentCompletionRate: Math.round(assignmentStats.completionRate) || 92,
      studyStreakDays: 14,
      dsaSolvedCount: 168,
      dsaTotalCount: 250,
      dsaCategories: [
        { name: "Dynamic Programming", solved: 38, total: 50, pct: 76 },
        { name: "Trees & Binary Search", solved: 42, total: 45, pct: 93 },
        { name: "Graphs (BFS/DFS)", solved: 30, total: 40, pct: 75 },
        { name: "Arrays & Strings", solved: 58, total: 60, pct: 96 },
      ],
      jobApplicationsCount: {
        applied: 12,
        interview: 3,
        offer: 1,
      },
      todayClasses: dynamicClasses,
      upcomingAssignments: dynamicAssignments,
      recentNotes: dynamicRecentNotes,
      notifications: mockNotifications,
    };
  },
};
