"use client";

import * as React from "react";
import { TimetableItem } from "@/services/timetable-service";
import { DayOfWeek, DAYS_OF_WEEK } from "@/schemas/timetable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, User, Trash2 } from "lucide-react";

interface WeeklyScheduleGridProps {
  classes: TimetableItem[];
  currentDay: string;
  onDeleteClass: (id: string) => void;
}

export function WeeklyScheduleGrid({
  classes,
  currentDay,
  onDeleteClass,
}: WeeklyScheduleGridProps) {
  // Map subjects to curated theme accents
  const getSubjectColor = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes("operating") || s.includes("os")) return "border-blue-500/40 bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300";
    if (s.includes("database") || s.includes("dbms")) return "border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300";
    if (s.includes("network")) return "border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300";
    if (s.includes("algorithm") || s.includes("dsa")) return "border-purple-500/40 bg-purple-50/50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300";
    if (s.includes("machine") || s.includes("ml")) return "border-rose-500/40 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300";
    return "border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300";
  };

  // Group by day of week
  const groupedClasses: Record<DayOfWeek, TimetableItem[]> = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  };

  for (const c of classes) {
    if (groupedClasses[c.day]) {
      groupedClasses[c.day].push(c);
    }
  }

  // Days to show (Monday - Friday + Saturday if any class exists)
  const displayDays: DayOfWeek[] = groupedClasses.Saturday.length > 0
    ? [...DAYS_OF_WEEK]
    : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {displayDays.map((day) => {
        const isToday = currentDay.toLowerCase() === day.toLowerCase();
        const dayClasses = groupedClasses[day];

        return (
          <div
            key={day}
            className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
              isToday
                ? "border-indigo-500/60 bg-indigo-50/20 dark:bg-indigo-950/10 shadow-md shadow-indigo-500/5 ring-1 ring-indigo-500/30"
                : "border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60"
            }`}
          >
            {/* Day Header */}
            <div className="pb-3 border-b border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">
                  {day}
                </h3>
                <span className="text-[11px] text-zinc-500">
                  {dayClasses.length} {dayClasses.length === 1 ? "Class" : "Classes"}
                </span>
              </div>
              {isToday && (
                <Badge variant="purple" className="text-[10px] py-0">
                  Today
                </Badge>
              )}
            </div>

            {/* Class Cards for this Day */}
            <div className="space-y-3 pt-3 flex-1">
              {dayClasses.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400 italic">
                  No classes scheduled
                </div>
              ) : (
                dayClasses.map((item) => {
                  const colorClass = getSubjectColor(item.subject);
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border ${colorClass} transition-all hover:scale-[1.01] relative group flex flex-col justify-between gap-2`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-xs leading-snug truncate">
                          {item.subject}
                        </h4>
                        <button
                          type="button"
                          onClick={() => onDeleteClass(item.id)}
                          aria-label={`Remove ${item.subject}`}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1 text-[11px] opacity-90">
                        <div className="flex items-center gap-1 font-semibold">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>
                            {item.startTime} - {item.endTime}
                          </span>
                        </div>

                        {item.room && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 shrink-0 text-zinc-400" />
                            <span>{item.room}</span>
                          </div>
                        )}

                        {item.faculty && (
                          <div className="flex items-center gap-1 text-[10px]">
                            <User className="w-3 h-3 shrink-0 text-zinc-400" />
                            <span className="truncate">{item.faculty}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
