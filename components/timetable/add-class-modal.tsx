"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DayOfWeek,
  DAYS_OF_WEEK,
  CreateTimetableEntryInput,
} from "@/schemas/timetable";
import { STANDARD_CSE_SUBJECTS } from "@/schemas/notes";
import { TimetableItem } from "@/services/timetable-service";
import {
  Calendar,
  X,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  Check,
  Loader2,
} from "lucide-react";

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingClasses: TimetableItem[];
  onSubmit: (data: CreateTimetableEntryInput) => Promise<boolean>;
}

export function AddClassModal({
  isOpen,
  onClose,
  existingClasses,
  onSubmit,
}: AddClassModalProps) {
  const [day, setDay] = React.useState<DayOfWeek>("Monday");
  const [subject, setSubject] = React.useState<string>(STANDARD_CSE_SUBJECTS[0]);
  const [isCustomSubject, setIsCustomSubject] = React.useState(false);
  const [customSubject, setCustomSubject] = React.useState("");
  const [startTime, setStartTime] = React.useState("09:00");
  const [endTime, setEndTime] = React.useState("10:15");
  const [room, setRoom] = React.useState("");
  const [faculty, setFaculty] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Live Clash Detection
  const clash = React.useMemo(() => {
    if (!startTime || !endTime) return null;
    const [newStartH, newStartM] = startTime.split(":").map(Number);
    const [newEndH, newEndM] = endTime.split(":").map(Number);
    const newStart = newStartH * 60 + newStartM;
    const newEnd = newEndH * 60 + newEndM;

    if (newStart >= newEnd) return null; // Invalid range handled separately

    const dayClasses = existingClasses.filter((c) => c.day === day);
    for (const c of dayClasses) {
      const [startH, startM] = c.startTime.split(":").map(Number);
      const [endH, endM] = c.endTime.split(":").map(Number);
      const existStart = startH * 60 + startM;
      const existEnd = endH * 60 + endM;

      if (!(newEnd <= existStart || newStart >= existEnd)) {
        return c;
      }
    }
    return null;
  }, [day, startTime, endTime, existingClasses]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const activeSubject = isCustomSubject ? customSubject.trim() : subject;
    if (!activeSubject) {
      setSubmitError("Please select or enter a course subject.");
      return;
    }

    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    if (startH * 60 + startM >= endH * 60 + endM) {
      setSubmitError("Start time must be earlier than end time.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateTimetableEntryInput = {
        subject: activeSubject,
        day,
        startTime,
        endTime,
        room: room.trim() || undefined,
        faculty: faculty.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const success = await onSubmit(payload);
      if (success) {
        onClose();
      } else {
        setSubmitError("Failed to save class. Please verify inputs.");
      }
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                Add Class Lecture / Lab
              </h2>
              <p className="text-xs text-zinc-500">
                Schedule a recurring lecture or laboratory slot
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {submitError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
              {submitError}
            </div>
          )}

          {/* Live Clash Alert Banner */}
          {clash && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1 animate-in fade-in">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Time Clash Detected!</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                This slot overlaps with <strong>{clash.subject}</strong> ({clash.startTime} - {clash.endTime}) on {day}. You can still proceed if this is an elective batch.
              </p>
            </div>
          )}

          {/* Day of Week */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Day of Week <span className="text-rose-500">*</span>
            </label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value as DayOfWeek)}
              aria-label="Select day"
              className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Course Subject <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomSubject(!isCustomSubject)}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {isCustomSubject ? "Pick standard" : "Custom subject"}
              </button>
            </div>

            {isCustomSubject ? (
              <Input
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="e.g. Cloud Computing Lab"
                className="h-10 text-xs rounded-xl"
              />
            ) : (
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                aria-label="Select course subject"
                className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {STANDARD_CSE_SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Time Pickers Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Start Time <span className="text-rose-500">*</span>
              </label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="h-10 text-xs rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                End Time <span className="text-rose-500">*</span>
              </label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="h-10 text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Room & Faculty */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Room / Lab Number
              </label>
              <Input
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. LH-301 or Lab-2"
                className="h-10 text-xs rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Faculty Name
              </label>
              <Input
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                placeholder="e.g. Prof. Verma"
                className="h-10 text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Class Notes (Optional)
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bring systems lab handbook"
              className="h-10 text-xs rounded-xl"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px] shadow-md shadow-indigo-500/20 gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Add Class</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
