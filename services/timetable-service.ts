import { prisma } from "@/lib/prisma";
import {
  DayOfWeek,
  DAYS_OF_WEEK,
  CreateTimetableEntryInput,
  UpdateTimetableEntryInput,
} from "@/schemas/timetable";

export interface TimetableItem {
  id: string;
  userId: string;
  subject: string;
  faculty: string | null;
  day: DayOfWeek;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  room: string | null;
  notes: string | null;
  createdAt: Date;
}

export interface TodayClassItem extends TimetableItem {
  status: "IN_PROGRESS" | "UPCOMING" | "COMPLETED";
}

// In-memory fallback timetable store
const mockTimetableStore = new Map<string, TimetableItem[]>();

function getInitialDemoTimetable(userId: string): TimetableItem[] {
  return [
    // Monday
    {
      id: "tt_mon_1",
      userId,
      subject: "Operating Systems",
      faculty: "Prof. Verma",
      day: "Monday",
      startTime: "09:00",
      endTime: "10:15",
      room: "LH-301",
      notes: "Process synchronization & semaphores discussion",
      createdAt: new Date(),
    },
    {
      id: "tt_mon_2",
      userId,
      subject: "Database Management Systems",
      faculty: "Dr. Radhika",
      day: "Monday",
      startTime: "10:30",
      endTime: "11:45",
      room: "LH-302",
      notes: "Relational algebra and normal forms",
      createdAt: new Date(),
    },
    {
      id: "tt_mon_3",
      userId,
      subject: "Computer Networks",
      faculty: "Prof. K. Sharma",
      day: "Monday",
      startTime: "13:00",
      endTime: "14:15",
      room: "LH-205",
      notes: "Data link layer framing & CRC",
      createdAt: new Date(),
    },
    {
      id: "tt_mon_4",
      userId,
      subject: "Systems Programming Lab",
      faculty: "Prof. Verma",
      day: "Monday",
      startTime: "14:30",
      endTime: "16:30",
      room: "Lab-2",
      notes: "POSIX threads and shared memory lab exercise",
      createdAt: new Date(),
    },

    // Tuesday
    {
      id: "tt_tue_1",
      userId,
      subject: "Design & Analysis of Algorithms",
      faculty: "Dr. S. Nair",
      day: "Tuesday",
      startTime: "09:30",
      endTime: "10:45",
      room: "LH-104",
      notes: "Greedy algorithms vs Dynamic Programming",
      createdAt: new Date(),
    },
    {
      id: "tt_tue_2",
      userId,
      subject: "Theory of Computation",
      faculty: "Prof. A. Gupta",
      day: "Tuesday",
      startTime: "11:00",
      endTime: "12:15",
      room: "LH-108",
      notes: "Regular expressions and pumping lemma",
      createdAt: new Date(),
    },
    {
      id: "tt_tue_3",
      userId,
      subject: "DBMS Implementation Lab",
      faculty: "Dr. Radhika",
      day: "Tuesday",
      startTime: "14:00",
      endTime: "16:00",
      room: "Lab-4",
      notes: "B+ Tree indexing and SQL query plan inspection",
      createdAt: new Date(),
    },

    // Wednesday
    {
      id: "tt_wed_1",
      userId,
      subject: "Operating Systems",
      faculty: "Prof. Verma",
      day: "Wednesday",
      startTime: "09:00",
      endTime: "10:15",
      room: "LH-301",
      notes: "Banker's Algorithm & Deadlock detection",
      createdAt: new Date(),
    },
    {
      id: "tt_wed_2",
      userId,
      subject: "Computer Networks",
      faculty: "Prof. K. Sharma",
      day: "Wednesday",
      startTime: "10:30",
      endTime: "11:45",
      room: "LH-205",
      notes: "Subnetting and CIDR address calculation",
      createdAt: new Date(),
    },
    {
      id: "tt_wed_3",
      userId,
      subject: "Software Engineering & Agile",
      faculty: "Prof. Deepa",
      day: "Wednesday",
      startTime: "13:30",
      endTime: "14:45",
      room: "LH-201",
      notes: "Sprint planning and Scrum master workflows",
      createdAt: new Date(),
    },

    // Thursday
    {
      id: "tt_thu_1",
      userId,
      subject: "Design & Analysis of Algorithms",
      faculty: "Dr. S. Nair",
      day: "Thursday",
      startTime: "09:30",
      endTime: "10:45",
      room: "LH-104",
      notes: "0/1 Knapsack & Bellman-Ford shortest paths",
      createdAt: new Date(),
    },
    {
      id: "tt_thu_2",
      userId,
      subject: "Machine Learning Foundations",
      faculty: "Dr. P. Roy",
      day: "Thursday",
      startTime: "11:00",
      endTime: "12:15",
      room: "LH-305",
      notes: "Stochastic gradient descent and backpropagation",
      createdAt: new Date(),
    },
    {
      id: "tt_thu_3",
      userId,
      subject: "Networks Simulation Lab",
      faculty: "Prof. K. Sharma",
      day: "Thursday",
      startTime: "14:00",
      endTime: "16:30",
      room: "Lab-1",
      notes: "ns-3 TCP congestion simulation",
      createdAt: new Date(),
    },

    // Friday
    {
      id: "tt_fri_1",
      userId,
      subject: "Database Management Systems",
      faculty: "Dr. Radhika",
      day: "Friday",
      startTime: "09:00",
      endTime: "10:15",
      room: "LH-302",
      notes: "Concurrency control & 2PL protocols",
      createdAt: new Date(),
    },
    {
      id: "tt_fri_2",
      userId,
      subject: "Machine Learning Foundations",
      faculty: "Dr. P. Roy",
      day: "Friday",
      startTime: "10:30",
      endTime: "11:45",
      room: "LH-305",
      notes: "Neural network activation functions",
      createdAt: new Date(),
    },
    {
      id: "tt_fri_3",
      userId,
      subject: "Open Source Project Mentorship",
      faculty: "Innovation Cell",
      day: "Friday",
      startTime: "13:00",
      endTime: "14:30",
      room: "Incubation Ctr",
      notes: "Weekly team sprint progress review",
      createdAt: new Date(),
    },
  ];
}

function getUserTimetableList(userId: string): TimetableItem[] {
  if (!mockTimetableStore.has(userId)) {
    mockTimetableStore.set(userId, getInitialDemoTimetable(userId));
  }
  return mockTimetableStore.get(userId)!;
}

export class TimetableService {
  /**
   * Fetch all timetable entries for a student
   */
  static async getWeeklyTimetable(userId: string): Promise<TimetableItem[]> {
    try {
      const dbEntries = await prisma.timetableEntry.findMany({
        where: { userId },
        orderBy: [{ day: "asc" }, { startTime: "asc" }],
      });

      if (dbEntries && dbEntries.length > 0) {
        return dbEntries.map((e) => ({
          ...e,
          day: e.day as DayOfWeek,
        }));
      }
    } catch {
      // In-memory fallback
    }

    const list = getUserTimetableList(userId);
    // Sort by day order then start time
    const dayOrder: Record<DayOfWeek, number> = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    return [...list].sort((a, b) => {
      const dayDiff = (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99);
      if (dayDiff !== 0) return dayDiff;
      return a.startTime.localeCompare(b.startTime);
    });
  }

  /**
   * Helper to get current day of week as DayOfWeek enum (Sunday maps to Monday for academic week)
   */
  static getCurrentDay(): DayOfWeek {
    const days: DayOfWeek[] = [
      "Saturday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const todayIndex = new Date().getDay();
    return todayIndex === 0 ? "Monday" : days[todayIndex];
  }

  /**
   * Fetch classes for a given day with computed live status
   */
  static async getTodayClasses(
    userId: string,
    targetDay?: DayOfWeek
  ): Promise<TodayClassItem[]> {
    const all = await this.getWeeklyTimetable(userId);

    // Determine target day
    let day = targetDay;
    if (!day) {
      const days: DayOfWeek[] = [
        "Saturday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const todayIndex = new Date().getDay();
      day = todayIndex === 0 ? "Monday" : days[todayIndex];
    }

    const dayClasses = all.filter((c) => c.day === day);

    // Compute live status based on current time (HH:MM)
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return dayClasses.map((c) => {
      const [startH, startM] = c.startTime.split(":").map(Number);
      const [endH, endM] = c.endTime.split(":").map(Number);
      const classStart = startH * 60 + startM;
      const classEnd = endH * 60 + endM;

      let status: "IN_PROGRESS" | "UPCOMING" | "COMPLETED" = "UPCOMING";
      if (currentMinutes >= classStart && currentMinutes <= classEnd) {
        status = "IN_PROGRESS";
      } else if (currentMinutes > classEnd) {
        status = "COMPLETED";
      }

      return {
        ...c,
        status,
      };
    });
  }

  /**
   * Conflict / Clash Detection: Check if a new class overlaps with an existing class on the same day
   */
  static async checkTimeClash(
    userId: string,
    day: DayOfWeek,
    startTime: string,
    endTime: string,
    excludeId?: string
  ): Promise<{ hasClash: boolean; conflictingClass?: TimetableItem }> {
    const all = await this.getWeeklyTimetable(userId);
    const dayClasses = all.filter((c) => c.day === day && c.id !== excludeId);

    const [newStartH, newStartM] = startTime.split(":").map(Number);
    const [newEndH, newEndM] = endTime.split(":").map(Number);
    const newStart = newStartH * 60 + newStartM;
    const newEnd = newEndH * 60 + newEndM;

    for (const c of dayClasses) {
      const [startH, startM] = c.startTime.split(":").map(Number);
      const [endH, endM] = c.endTime.split(":").map(Number);
      const existStart = startH * 60 + startM;
      const existEnd = endH * 60 + endM;

      // Overlap condition: !(newEnd <= existStart || newStart >= existEnd)
      if (!(newEnd <= existStart || newStart >= existEnd)) {
        return { hasClash: true, conflictingClass: c };
      }
    }

    return { hasClash: false };
  }

  /**
   * Add class to timetable
   */
  static async createEntry(
    userId: string,
    input: CreateTimetableEntryInput
  ): Promise<TimetableItem> {
    const newEntry: TimetableItem = {
      id: `tt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      subject: input.subject,
      faculty: input.faculty || null,
      day: input.day,
      startTime: input.startTime,
      endTime: input.endTime,
      room: input.room || null,
      notes: input.notes || null,
      createdAt: new Date(),
    };

    try {
      const created = await prisma.timetableEntry.create({
        data: {
          id: newEntry.id,
          userId,
          subject: newEntry.subject,
          faculty: newEntry.faculty,
          day: newEntry.day,
          startTime: newEntry.startTime,
          endTime: newEntry.endTime,
          room: newEntry.room,
          notes: newEntry.notes,
        },
      });
      return {
        ...created,
        day: created.day as DayOfWeek,
      };
    } catch {
      const list = getUserTimetableList(userId);
      list.push(newEntry);
      mockTimetableStore.set(userId, list);
      return newEntry;
    }
  }

  /**
   * Update existing timetable entry
   */
  static async updateEntry(
    id: string,
    userId: string,
    input: UpdateTimetableEntryInput
  ): Promise<TimetableItem> {
    try {
      const updated = await prisma.timetableEntry.update({
        where: { id },
        data: {
          ...(input.subject !== undefined ? { subject: input.subject } : {}),
          ...(input.faculty !== undefined ? { faculty: input.faculty } : {}),
          ...(input.day !== undefined ? { day: input.day } : {}),
          ...(input.startTime !== undefined ? { startTime: input.startTime } : {}),
          ...(input.endTime !== undefined ? { endTime: input.endTime } : {}),
          ...(input.room !== undefined ? { room: input.room } : {}),
          ...(input.notes !== undefined ? { notes: input.notes } : {}),
        },
      });
      return {
        ...updated,
        day: updated.day as DayOfWeek,
      };
    } catch {
      const list = getUserTimetableList(userId);
      const index = list.findIndex((c) => c.id === id && c.userId === userId);
      if (index === -1) throw new Error("Class not found or unauthorized");

      const existing = list[index];
      const merged: TimetableItem = {
        ...existing,
        ...input,
      };
      list[index] = merged;
      mockTimetableStore.set(userId, list);
      return merged;
    }
  }

  /**
   * Delete class entry
   */
  static async deleteEntry(id: string, userId: string): Promise<boolean> {
    try {
      await prisma.timetableEntry.delete({
        where: { id },
      });
      return true;
    } catch {
      const list = getUserTimetableList(userId);
      const index = list.findIndex((c) => c.id === id && c.userId === userId);
      if (index !== -1) {
        list.splice(index, 1);
        mockTimetableStore.set(userId, list);
        return true;
      }
      return false;
    }
  }

  /**
   * Generates standard RFC 5545 iCalendar (.ics) string for importing into Google/Apple Calendar
   */
  static async generateIcsCalendar(userId: string): Promise<string> {
    const classes = await this.getWeeklyTimetable(userId);

    const icsDayMap: Record<DayOfWeek, string> = {
      Monday: "MO",
      Tuesday: "TU",
      Wednesday: "WE",
      Thursday: "TH",
      Friday: "FR",
      Saturday: "SA",
    };

    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//CampusFlow//Academic Schedule v1.0//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:CampusFlow Class Timetable",
      "X-WR-TIMEZONE:Asia/Kolkata",
    ];

    for (const c of classes) {
      const dayCode = icsDayMap[c.day] || "MO";
      const startClean = c.startTime.replace(":", "") + "00";
      const endClean = c.endTime.replace(":", "") + "00";

      icsContent.push(
        "BEGIN:VEVENT",
        `UID:${c.id}@campusflow.edu`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
        `RRULE:FREQ=WEEKLY;BYDAY=${dayCode}`,
        `SUMMARY:${c.subject} (${c.room || "Classroom"})`,
        `DESCRIPTION:${c.faculty ? `Faculty: ${c.faculty}\\n` : ""}${c.notes || ""}`,
        `LOCATION:${c.room || "Campus"}`,
        `STATUS:CONFIRMED`,
        "END:VEVENT"
      );
    }

    icsContent.push("END:VCALENDAR");
    return icsContent.join("\r\n");
  }
}
