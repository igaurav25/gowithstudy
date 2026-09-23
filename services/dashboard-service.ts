import { StoredUser, AuthService } from "@/services/auth-service";
import { ProfileService, StudentProfileData } from "@/services/profile-service";
import { NotesService } from "@/services/notes-service";

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

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDay = days[new Date().getDay()];

    const mockClasses: ClassScheduleItem[] = [
      {
        id: "cls_1",
        subject: "Database Management Systems",
        faculty: "Dr. Sharma",
        time: "10:00 AM - 11:30 AM",
        room: "Hall 302",
        day: currentDay,
        status: "COMPLETED",
      },
      {
        id: "cls_2",
        subject: "Design & Analysis of Algorithms",
        faculty: "Prof. Rajesh Mehta",
        time: "01:30 PM - 03:00 PM",
        room: "CS Lab 2",
        day: currentDay,
        status: "IN_PROGRESS",
      },
      {
        id: "cls_3",
        subject: "Computer Networks & Security",
        faculty: "Dr. Kavita Verma",
        time: "03:15 PM - 04:45 PM",
        room: "Room 105",
        day: currentDay,
        status: "UPCOMING",
      },
    ];

    const mockAssignments: UpcomingAssignmentItem[] = [
      {
        id: "asg_1",
        title: "B+ Tree Indexing & Transaction Concurrency Report",
        subject: "DBMS",
        dueDate: "Tomorrow, 11:59 PM",
        dueDays: 1,
        priority: "URGENT",
        completed: false,
      },
      {
        id: "asg_2",
        title: "Dijkstra & Prim's Algorithm Optimization Analysis",
        subject: "DAA",
        dueDate: "Friday, 05:00 PM",
        dueDays: 2,
        priority: "HIGH",
        completed: false,
      },
      {
        id: "asg_3",
        title: "TCP Congestion Control Simulation using ns-3",
        subject: "Networks",
        dueDate: "Next Monday",
        dueDays: 5,
        priority: "MEDIUM",
        completed: true,
      },
    ];

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
      assignmentCompletionRate: 92,
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
      todayClasses: mockClasses,
      upcomingAssignments: mockAssignments,
      recentNotes: dynamicRecentNotes,
      notifications: mockNotifications,
    };
  },
};
