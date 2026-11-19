import {
  SubjectAttendanceItem,
  SubjectComputedStats,
  OverallAttendanceSummary,
  CreateSubjectAttendanceInput,
  UpdateSubjectAttendanceInput,
  AttendanceStatus,
} from "@/schemas/attendance";

// In-memory store per user (synced with demo semester subjects)
const attendanceStore = new Map<string, SubjectAttendanceItem[]>();

function getInitialSemesterSubjects(userId: string): SubjectAttendanceItem[] {
  const now = new Date();
  return [
    {
      id: "att_subj_os",
      userId,
      subject: "Operating Systems",
      code: "CS-301",
      attended: 24,
      total: 28,
      targetPercentage: 75,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "att_subj_dbms",
      userId,
      subject: "Database Management Systems",
      code: "CS-302",
      attended: 22,
      total: 26,
      targetPercentage: 75,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "att_subj_cn",
      userId,
      subject: "Computer Networks",
      code: "CS-303",
      attended: 18,
      total: 24,
      targetPercentage: 75,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "att_subj_daa",
      userId,
      subject: "Design & Analysis of Algorithms",
      code: "CS-304",
      attended: 19,
      total: 26,
      targetPercentage: 75,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "att_subj_se",
      userId,
      subject: "Software Engineering",
      code: "CS-305",
      attended: 14,
      total: 20,
      targetPercentage: 75,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export class AttendanceService {
  /**
   * Pure Mathematical Bunk & Recovery Calculator (75% Rule Engine)
   */
  static calculateBunkStats(
    attended: number,
    total: number,
    target = 75
  ): {
    percentage: number;
    status: "SAFE" | "BORDERLINE" | "DANGER";
    safeBunks: number;
    classesToRecover: number;
    bunkAdvice: string;
  } {
    if (total === 0) {
      return {
        percentage: 100,
        status: "SAFE",
        safeBunks: 0,
        classesToRecover: 0,
        bunkAdvice: "No classes conducted yet.",
      };
    }

    const percentage = Math.round((attended / total) * 100);
    const targetRatio = target / 100;

    if (percentage >= target) {
      // Formula: B <= (P - R * T) / R
      const rawBunks = Math.floor((attended - targetRatio * total) / targetRatio);
      const safeBunks = Math.max(0, rawBunks);

      const status: "SAFE" | "BORDERLINE" =
        percentage >= target + 5 ? "SAFE" : "BORDERLINE";

      let bunkAdvice = "";
      if (safeBunks > 0) {
        bunkAdvice = `You can safely bunk next ${safeBunks} ${
          safeBunks === 1 ? "class" : "classes"
        }.`;
      } else {
        bunkAdvice = `On track (${percentage}%). Missing 1 class drops you to ${Math.round(
          (attended / (total + 1)) * 100
        )}%.`;
      }

      return {
        percentage,
        status,
        safeBunks,
        classesToRecover: 0,
        bunkAdvice,
      };
    } else {
      // Below target: Formula: C >= (R * T - P) / (1 - R)
      const rawRecover = Math.ceil((targetRatio * total - attended) / (1 - targetRatio));
      const classesToRecover = Math.max(1, rawRecover);

      return {
        percentage,
        status: "DANGER",
        safeBunks: 0,
        classesToRecover,
        bunkAdvice: `Debar Risk! Attend next ${classesToRecover} consecutive ${
          classesToRecover === 1 ? "class" : "classes"
        } to reach ${target}%.`,
      };
    }
  }

  /**
   * Retrieves user's attendance records with computed metrics
   */
  static async getAttendance(userId: string): Promise<OverallAttendanceSummary> {
    let records = attendanceStore.get(userId);
    if (!records) {
      records = getInitialSemesterSubjects(userId);
      attendanceStore.set(userId, records);
    }

    let totalAttended = 0;
    let totalConducted = 0;
    let safeCount = 0;
    let riskCount = 0;

    const subjects: SubjectComputedStats[] = records.map((rec) => {
      totalAttended += rec.attended;
      totalConducted += rec.total;

      const stats = this.calculateBunkStats(
        rec.attended,
        rec.total,
        rec.targetPercentage
      );

      if (stats.status === "DANGER") {
        riskCount++;
      } else {
        safeCount++;
      }

      return {
        ...rec,
        ...stats,
      };
    });

    const overallPercentage =
      totalConducted === 0 ? 100 : Math.round((totalAttended / totalConducted) * 100);

    return {
      overallPercentage,
      totalAttended,
      totalConducted,
      safeSubjectCount: safeCount,
      riskSubjectCount: riskCount,
      targetPercentage: 75,
      subjects,
    };
  }

  /**
   * Fast helper to fetch just the overall attendance percentage for the dashboard
   */
  static async getOverallPercentage(userId: string): Promise<number> {
    const data = await this.getAttendance(userId);
    return data.overallPercentage;
  }

  /**
   * Marks daily attendance directly from the timetable or quick action
   */
  static async markAttendance(
    userId: string,
    subjectName: string,
    status: AttendanceStatus
  ): Promise<SubjectComputedStats> {
    await this.getAttendance(userId);
    const records = attendanceStore.get(userId) || [];

    // Find subject matching name or code (case-insensitive substring)
    const normalized = subjectName.toLowerCase().trim();
    let record = records.find(
      (r) =>
        r.subject.toLowerCase() === normalized ||
        normalized.includes(r.subject.toLowerCase()) ||
        r.subject.toLowerCase().includes(normalized)
    );

    if (!record) {
      // Auto-create new subject entry if student marks attendance for an unlisted class
      record = {
        id: `att_subj_${Date.now()}`,
        userId,
        subject: subjectName.trim(),
        code: null,
        attended: status === "PRESENT" ? 1 : 0,
        total: 1,
        targetPercentage: 75,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      records.push(record);
    } else {
      record.total += 1;
      if (status === "PRESENT") {
        record.attended += 1;
      }
      record.updatedAt = new Date();
    }

    attendanceStore.set(userId, records);
    const stats = this.calculateBunkStats(
      record.attended,
      record.total,
      record.targetPercentage
    );

    return {
      ...record,
      ...stats,
    };
  }

  /**
   * Updates an existing subject's attendance figures (e.g. from college ERP portal sync)
   */
  static async updateSubject(
    userId: string,
    input: UpdateSubjectAttendanceInput
  ): Promise<SubjectComputedStats> {
    await this.getAttendance(userId);
    const records = attendanceStore.get(userId) || [];

    const index = records.findIndex((r) => r.id === input.subjectId);
    if (index === -1) {
      throw new Error("Subject record not found.");
    }

    const rec = records[index];
    rec.attended = input.attended;
    rec.total = input.total;
    if (input.targetPercentage) {
      rec.targetPercentage = input.targetPercentage;
    }
    rec.updatedAt = new Date();

    records[index] = rec;
    attendanceStore.set(userId, records);

    const stats = this.calculateBunkStats(
      rec.attended,
      rec.total,
      rec.targetPercentage
    );

    return {
      ...rec,
      ...stats,
    };
  }

  /**
   * Adds a new course or elective subject to the attendance tracker
   */
  static async addSubject(
    userId: string,
    input: CreateSubjectAttendanceInput
  ): Promise<SubjectComputedStats> {
    await this.getAttendance(userId);
    const records = attendanceStore.get(userId) || [];

    const newRec: SubjectAttendanceItem = {
      id: `att_subj_${Date.now()}`,
      userId,
      subject: input.subject.trim(),
      code: input.code?.trim() || null,
      attended: input.attended,
      total: input.total,
      targetPercentage: input.targetPercentage || 75,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    records.push(newRec);
    attendanceStore.set(userId, records);

    const stats = this.calculateBunkStats(
      newRec.attended,
      newRec.total,
      newRec.targetPercentage
    );

    return {
      ...newRec,
      ...stats,
    };
  }

  /**
   * Deletes a subject from tracking
   */
  static async deleteSubject(userId: string, subjectId: string): Promise<boolean> {
    await this.getAttendance(userId);
    const records = attendanceStore.get(userId) || [];
    const filtered = records.filter((r) => r.id !== subjectId);
    attendanceStore.set(userId, filtered);
    return true;
  }
}
