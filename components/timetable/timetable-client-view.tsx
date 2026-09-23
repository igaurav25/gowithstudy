"use client";

import * as React from "react";
import { TimetableItem } from "@/services/timetable-service";
import { DayOfWeek } from "@/schemas/timetable";
import { TimetableHeader } from "@/components/timetable/timetable-header";
import { WeeklyScheduleGrid } from "@/components/timetable/weekly-schedule-grid";
import { DailyAgendaView } from "@/components/timetable/daily-agenda-view";
import { AddClassModal } from "@/components/timetable/add-class-modal";
import {
  createTimetableEntryAction,
  deleteTimetableEntryAction,
} from "@/features/timetable/actions";
import { CreateTimetableEntryInput } from "@/schemas/timetable";
import { Check, AlertCircle } from "lucide-react";

interface TimetableClientViewProps {
  initialClasses: TimetableItem[];
  currentDay: DayOfWeek;
  autoOpenAdd?: boolean;
}

export function TimetableClientView({
  initialClasses,
  currentDay,
  autoOpenAdd = false,
}: TimetableClientViewProps) {
  const [classes, setClasses] = React.useState<TimetableItem[]>(initialClasses);
  const [viewMode, setViewMode] = React.useState<"grid" | "agenda">("grid");
  const [selectedDay, setSelectedDay] = React.useState<DayOfWeek>(currentDay);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(autoOpenAdd);

  const [toastMessage, setToastMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Add class handler
  const handleAddClass = async (data: CreateTimetableEntryInput): Promise<boolean> => {
    const res = await createTimetableEntryAction(data);
    if (res.success && res.data) {
      setClasses([...classes, res.data]);
      showToast("Class scheduled successfully!");
      return true;
    }
    showToast(res.message || "Failed to add class", "error");
    return false;
  };

  // Delete class handler
  const handleDeleteClass = async (id: string) => {
    const updated = classes.filter((c) => c.id !== id);
    setClasses(updated);

    const res = await deleteTimetableEntryAction(id);
    if (res.success) {
      showToast("Class removed from schedule.");
    } else {
      showToast(res.message || "Failed to delete class", "error");
    }
  };

  // Export RFC 5545 iCalendar (.ics)
  const handleExportIcs = () => {
    const icsDayMap: Record<DayOfWeek, string> = {
      Monday: "MO",
      Tuesday: "TU",
      Wednesday: "WE",
      Thursday: "TH",
      Friday: "FR",
      Saturday: "SA",
    };

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//CampusFlow//Academic Timetable//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:CampusFlow Timetable",
    ];

    for (const c of classes) {
      const dayCode = icsDayMap[c.day] || "MO";
      lines.push(
        "BEGIN:VEVENT",
        `UID:${c.id}@campusflow.edu`,
        `RRULE:FREQ=WEEKLY;BYDAY=${dayCode}`,
        `SUMMARY:${c.subject} (${c.room || "Campus"})`,
        `DESCRIPTION:${c.faculty ? `Faculty: ${c.faculty}` : "Lecture Session"}`,
        `LOCATION:${c.room || "Lecture Hall"}`,
        "STATUS:CONFIRMED",
        "END:VEVENT"
      );
    }
    lines.push("END:VCALENDAR");

    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "campusflow_timetable.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Downloaded iCalendar (.ics) file!");
  };

  const todayCount = classes.filter((c) => c.day === currentDay).length;

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 border animate-in slide-in-from-bottom-5 duration-200 ${
            toastMessage.type === "success"
              ? "bg-zinc-900 text-white border-zinc-700"
              : "bg-rose-900 text-white border-rose-700"
          }`}
        >
          {toastMessage.type === "success" ? (
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
          <span className="text-xs font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <TimetableHeader
        totalClasses={classes.length}
        todayClassesCount={todayCount}
        currentDay={currentDay}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onExportIcs={handleExportIcs}
      />

      {/* Views */}
      {viewMode === "grid" ? (
        <WeeklyScheduleGrid
          classes={classes}
          currentDay={currentDay}
          onDeleteClass={handleDeleteClass}
        />
      ) : (
        <DailyAgendaView
          allClasses={classes}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          onDeleteClass={handleDeleteClass}
        />
      )}

      {/* Add Class Modal */}
      <AddClassModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        existingClasses={classes}
        onSubmit={handleAddClass}
      />
    </div>
  );
}
