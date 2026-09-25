"use client";

import * as React from "react";
import Link from "next/link";
import { ClassScheduleItem } from "@/services/dashboard-service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  Sparkles,
  BookOpen,
  X,
  Check,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

export function TimetableWidget({ classes }: { classes: ClassScheduleItem[] }) {
  const [selectedClass, setSelectedClass] = React.useState<ClassScheduleItem | null>(null);
  const [attendanceState, setAttendanceState] = React.useState<Record<string, "PRESENT" | "ABSENT">>({});
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const handleMarkAttendance = (id: string, status: "PRESENT" | "ABSENT") => {
    setAttendanceState((prev) => ({ ...prev, [id]: status }));
    const msg = status === "PRESENT" ? "Attendance marked: Present ✅" : "Attendance marked: Absent ❌";
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <>
      <Card className="border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base">Today&apos;s Timetable</CardTitle>
                <CardDescription className="text-xs">
                  {classes.length} academic sessions • Click any class for details
                </CardDescription>
              </div>
            </div>
            <Badge variant="purple" className="text-[11px]">
              Interactive
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-1">
          {classes.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-500 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <p className="font-semibold text-zinc-700 dark:text-zinc-300">No classes scheduled for today!</p>
              <p className="mt-1">Enjoy your study break or practice DSA problems.</p>
            </div>
          ) : (
            classes.map((cls) => {
              const isLive = cls.status === "IN_PROGRESS";
              const isUpcoming = cls.status === "UPCOMING";
              const userAttendance = attendanceState[cls.id];

              return (
                <div
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-150 hover:scale-[1.01] hover:shadow-md ${
                    isLive
                      ? "border-emerald-500/60 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm"
                      : isUpcoming
                      ? "border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-indigo-300 dark:hover:border-indigo-800"
                      : "border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/30 opacity-75"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                          {cls.subject}
                        </h4>
                        {userAttendance && (
                          <Badge
                            variant={userAttendance === "PRESENT" ? "success" : "destructive"}
                            className="text-[10px] py-0"
                          >
                            {userAttendance === "PRESENT" ? "Attended" : "Missed"}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          {cls.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          {cls.room}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-zinc-400" />
                          {cls.faculty}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isLive && (
                        <Badge variant="success" className="text-[10px] animate-pulse">
                          ● Live Now
                        </Badge>
                      )}
                      {isUpcoming && (
                        <Badge variant="purple" className="text-[10px]">
                          Upcoming
                        </Badge>
                      )}
                      {cls.status === "COMPLETED" && (
                        <Badge variant="outline" className="text-[10px]">
                          Finished
                        </Badge>
                      )}
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <div className="pt-2 flex items-center justify-between text-xs">
            <span className="text-zinc-400">💡 Click any class card to view session notes & mark attendance</span>
            <Link
              href="/dashboard/timetable"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
            >
              Full Schedule →
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Class Detail Modal */}
      {selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="purple" className="text-xs">
                    {selectedClass.day} Session
                  </Badge>
                  {selectedClass.status === "IN_PROGRESS" && (
                    <Badge variant="success" className="text-xs animate-pulse">
                      ● Ongoing Now
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {selectedClass.subject}
                </h3>
                <p className="text-xs text-zinc-500">
                  Instructor: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{selectedClass.faculty}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedClass(null)}
                aria-label="Close session popup"
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Session Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800">
                <span className="text-zinc-400 block text-[11px]">Class Time</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 mt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  {selectedClass.time}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800">
                <span className="text-zinc-400 block text-[11px]">Location</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {selectedClass.room}
                </span>
              </div>
            </div>

            {/* Attendance Check-in Section */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-900 dark:text-indigo-200">
                  Attendance Tracker
                </span>
                <span className="text-zinc-500 text-[11px]">
                  Status:{" "}
                  <b className="text-zinc-800 dark:text-zinc-200">
                    {attendanceState[selectedClass.id] || "Not Marked"}
                  </b>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant={attendanceState[selectedClass.id] === "PRESENT" ? "default" : "outline"}
                  onClick={() => handleMarkAttendance(selectedClass.id, "PRESENT")}
                  className={`text-xs gap-1.5 ${
                    attendanceState[selectedClass.id] === "PRESENT"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "border-emerald-300 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark Present</span>
                </Button>

                <Button
                  size="sm"
                  variant={attendanceState[selectedClass.id] === "ABSENT" ? "default" : "outline"}
                  onClick={() => handleMarkAttendance(selectedClass.id, "ABSENT")}
                  className={`text-xs gap-1.5 ${
                    attendanceState[selectedClass.id] === "ABSENT"
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : "border-rose-300 text-rose-700 dark:text-rose-400 hover:bg-rose-50"
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Mark Absent</span>
                </Button>
              </div>
            </div>

            {/* Study Actions */}
            <div className="space-y-2 pt-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Study & Preparation Links
              </h4>
              <div className="grid grid-cols-1 gap-2">
                <Link
                  href={`/dashboard/notes?subject=${encodeURIComponent(selectedClass.subject)}`}
                  className="w-full"
                >
                  <Button variant="outline" className="w-full justify-between text-xs h-10">
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-500" />
                      <span>Open Notes for {selectedClass.subject}</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  </Button>
                </Link>

                <Link
                  href={`/dashboard/syllabus`}
                  className="w-full"
                >
                  <Button variant="outline" className="w-full justify-between text-xs h-10">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      <span>Check Unit Syllabus for this Subject</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  </Button>
                </Link>

                <Link
                  href={`/dashboard/ai?query=${encodeURIComponent(`Explain the core university exam concepts for ${selectedClass.subject}`)}`}
                  className="w-full"
                >
                  <Button className="w-full justify-between text-xs h-10 bg-indigo-600 hover:bg-indigo-700 text-white">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Ask AI Tutor About This Subject</span>
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-zinc-900 text-white shadow-2xl border border-zinc-800 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
