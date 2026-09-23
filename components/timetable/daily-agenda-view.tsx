"use client";

import * as React from "react";
import { TimetableItem, TodayClassItem } from "@/services/timetable-service";
import { DayOfWeek, DAYS_OF_WEEK } from "@/schemas/timetable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, User, FileText, Trash2, CheckCircle2 } from "lucide-react";

interface DailyAgendaViewProps {
  allClasses: TimetableItem[];
  selectedDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  onDeleteClass: (id: string) => void;
}

export function DailyAgendaView({
  allClasses,
  selectedDay,
  onSelectDay,
  onDeleteClass,
}: DailyAgendaViewProps) {
  // Filter classes for the selected day
  const dayClasses = allClasses
    .filter((c) => c.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Compute status for selected day
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <div className="space-y-6">
      {/* Day Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = selectedDay === day;
          const count = allClasses.filter((c) => c.day === day).length;
          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDay(day)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-indigo-400"
              }`}
            >
              <span>{day}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Timeline Agenda Cards */}
      <div className="space-y-4">
        {dayClasses.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30 text-zinc-400">
            <Clock className="w-8 h-8 mx-auto mb-2 text-indigo-400" />
            <p className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">
              No classes scheduled for {selectedDay}
            </p>
            <p className="text-xs mt-1">Enjoy your study break or prepare upcoming assignments.</p>
          </div>
        ) : (
          dayClasses.map((item, idx) => {
            const [startH, startM] = item.startTime.split(":").map(Number);
            const [endH, endM] = item.endTime.split(":").map(Number);
            const classStart = startH * 60 + startM;
            const classEnd = endH * 60 + endM;

            let status: "IN_PROGRESS" | "UPCOMING" | "COMPLETED" = "UPCOMING";
            if (currentMinutes >= classStart && currentMinutes <= classEnd) {
              status = "IN_PROGRESS";
            } else if (currentMinutes > classEnd) {
              status = "COMPLETED";
            }

            return (
              <div
                key={item.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  status === "IN_PROGRESS"
                    ? "border-emerald-500/80 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/40"
                    : status === "COMPLETED"
                    ? "border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/40 opacity-75"
                    : "border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 shadow-sm"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Time block badge */}
                  <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-center min-w-[90px] shrink-0">
                    <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 block">
                      {item.startTime}
                    </span>
                    <span className="text-[11px] font-medium text-zinc-400 block">
                      to {item.endTime}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                        {item.subject}
                      </h3>
                      {status === "IN_PROGRESS" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white flex items-center gap-1 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          Happening Now
                        </span>
                      )}
                      {status === "COMPLETED" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          Completed
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
                      {item.room && (
                        <span className="flex items-center gap-1 font-semibold text-zinc-700 dark:text-zinc-300">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                          {item.room}
                        </span>
                      )}
                      {item.faculty && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {item.faculty}
                        </span>
                      )}
                    </div>

                    {item.notes && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 pt-0.5 italic">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteClass(item.id)}
                    className="h-8 text-xs text-zinc-400 hover:text-rose-600 gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
