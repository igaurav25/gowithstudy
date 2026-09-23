import { ClassScheduleItem } from "@/services/dashboard-service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function TimetableWidget({ classes }: { classes: ClassScheduleItem[] }) {
  return (
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
                {classes.length} academic sessions scheduled
              </CardDescription>
            </div>
          </div>
          <Badge variant="purple" className="text-[11px]">
            Live Schedule
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
            return (
              <div
                key={cls.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isLive
                    ? "border-emerald-500/50 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm"
                    : isUpcoming
                    ? "border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60"
                    : "border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/30 opacity-70"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                      {cls.subject}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
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

                  <div>
                    {isLive && (
                      <Badge variant="success" className="text-[10px] animate-pulse">
                        ● In Progress
                      </Badge>
                    )}
                    {isUpcoming && (
                      <Badge variant="purple" className="text-[10px]">
                        Upcoming
                      </Badge>
                    )}
                    {cls.status === "COMPLETED" && (
                      <Badge variant="outline" className="text-[10px]">
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div className="pt-2 text-right">
          <Link
            href="/dashboard/timetable"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View Full Weekly Timetable →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
