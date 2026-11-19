import {
  ExamItem,
  PomodoroLog,
} from "@/schemas/exam-timer";

// User-specific custom exams store
const userExamsStore = new Map<string, ExamItem[]>();
const userPomodoroStore = new Map<string, PomodoroLog[]>();

export interface ExamCountdownStats {
  days: number;
  hours: number;
  minutes: number;
  urgency: "CRITICAL" | "UPCOMING" | "FAR";
  isToday: boolean;
  hasPassed: boolean;
}

export class ExamTimerService {
  /**
   * Get upcoming university exams for student
   */
  static getExams(userId: string): ExamItem[] {
    const userExams = userExamsStore.get(userId);
    if (userExams && userExams.length > 0) {
      return [...userExams].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }

    // Default semester exam schedule for college students (e.g. within 10 to 45 days)
    const now = new Date();
    const addDays = (d: number) => {
      const target = new Date(now);
      target.setDate(target.getDate() + d);
      return target;
    };

    const defaultExams: ExamItem[] = [
      {
        id: "exam_os_mid",
        subject: "Operating Systems",
        courseCode: "CS-301",
        category: "MID_SEM",
        date: addDays(8),
        time: "10:00 AM - 12:00 PM",
        venue: "Hall 302, Academic Block A",
        targetScore: 85,
        syllabusCompletedPercent: 70,
      },
      {
        id: "exam_dbms_mid",
        subject: "Database Management Systems",
        courseCode: "CS-302",
        category: "MID_SEM",
        date: addDays(11),
        time: "02:00 PM - 04:00 PM",
        venue: "Hall 204, IT Block",
        targetScore: 90,
        syllabusCompletedPercent: 65,
      },
      {
        id: "exam_cn_viva",
        subject: "Computer Networks Lab & Viva",
        courseCode: "CS-303P",
        category: "PRACTICAL_VIVA",
        date: addDays(18),
        time: "09:30 AM - 12:30 PM",
        venue: "Network Simulation Lab (Room 112)",
        targetScore: 95,
        syllabusCompletedPercent: 85,
      },
      {
        id: "exam_daa_end",
        subject: "Design & Analysis of Algorithms",
        courseCode: "CS-304",
        category: "END_SEM",
        date: addDays(38),
        time: "10:00 AM - 01:00 PM",
        venue: "Main University Auditorium",
        targetScore: 85,
        syllabusCompletedPercent: 40,
      },
    ];

    userExamsStore.set(userId, defaultExams);
    return defaultExams;
  }

  /**
   * Calculates precise countdown and urgency label
   */
  static calculateCountdown(
    examDate: Date,
    referenceDate: Date = new Date()
  ): ExamCountdownStats {
    const diffMs = new Date(examDate).getTime() - referenceDate.getTime();

    if (diffMs <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        urgency: "CRITICAL",
        isToday: true,
        hasPassed: true,
      };
    }

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    let urgency: "CRITICAL" | "UPCOMING" | "FAR" = "FAR";
    if (days <= 3) {
      urgency = "CRITICAL";
    } else if (days <= 14) {
      urgency = "UPCOMING";
    }

    return {
      days,
      hours,
      minutes,
      urgency,
      isToday: days === 0,
      hasPassed: false,
    };
  }

  /**
   * Add a custom exam
   */
  static addExam(
    userId: string,
    exam: Omit<ExamItem, "id">
  ): ExamItem {
    const newExam: ExamItem = {
      ...exam,
      id: `exam_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };

    const existing = this.getExams(userId);
    const updated = [...existing, newExam].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    userExamsStore.set(userId, updated);
    return newExam;
  }

  /**
   * Log completed Pomodoro session
   */
  static logPomodoro(
    userId: string,
    subject: string,
    durationMinutes: number
  ): PomodoroLog {
    const log: PomodoroLog = {
      id: `pomo_${Date.now()}`,
      userId,
      subject,
      durationMinutes,
      completedAt: new Date(),
    };

    const existing = userPomodoroStore.get(userId) || [];
    existing.push(log);
    userPomodoroStore.set(userId, existing);
    return log;
  }

  /**
   * Get total focused study minutes for today
   */
  static getTodayStudyMinutes(userId: string): number {
    const logs = userPomodoroStore.get(userId) || [];
    const today = new Date().toDateString();
    return logs
      .filter((l) => new Date(l.completedAt).toDateString() === today)
      .reduce((sum, l) => sum + l.durationMinutes, 0);
  }
}
