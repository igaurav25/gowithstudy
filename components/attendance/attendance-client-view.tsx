"use client";

import * as React from "react";
import {
  OverallAttendanceSummary,
  SubjectComputedStats,
} from "@/schemas/attendance";
import {
  markAttendanceAction,
  updateSubjectAttendanceAction,
  addSubjectAttendanceAction,
  deleteSubjectAttendanceAction,
} from "@/features/attendance/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Edit2,
  Calculator,
} from "lucide-react";

interface AttendanceClientViewProps {
  initialData: OverallAttendanceSummary;
}

export function AttendanceClientView({ initialData }: AttendanceClientViewProps) {
  const [data, setData] = React.useState<OverallAttendanceSummary>(initialData);
  const [isPending, startTransition] = React.useTransition();
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Modal states
  const [editingSubject, setEditingSubject] = React.useState<SubjectComputedStats | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  // New subject form
  const [newSubjectName, setNewSubjectName] = React.useState("");
  const [newSubjectCode, setNewSubjectCode] = React.useState("");
  const [newAttended, setNewAttended] = React.useState("20");
  const [newTotal, setNewTotal] = React.useState("24");

  // Edit subject form
  const [editAttended, setEditAttended] = React.useState("");
  const [editTotal, setEditTotal] = React.useState("");

  // Bunk Simulator
  const [simulatedBunks, setSimulatedBunks] = React.useState(2);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleQuickMark = (subjectName: string, status: "PRESENT" | "ABSENT") => {
    startTransition(async () => {
      const res = await markAttendanceAction({ subject: subjectName, status });
      if (res.success && res.data) {
        showToast(res.message || "Attendance updated!");
        // Update local state
        setData((prev) => {
          const updatedSubjects = prev.subjects.map((s) =>
            s.id === res.data!.id ? res.data! : s
          );
          const totalAttended = updatedSubjects.reduce((acc, s) => acc + s.attended, 0);
          const totalConducted = updatedSubjects.reduce((acc, s) => acc + s.total, 0);
          const overallPercentage =
            totalConducted === 0 ? 100 : Math.round((totalAttended / totalConducted) * 100);
          const safeCount = updatedSubjects.filter((s) => s.status !== "DANGER").length;
          const riskCount = updatedSubjects.filter((s) => s.status === "DANGER").length;

          return {
            ...prev,
            overallPercentage,
            totalAttended,
            totalConducted,
            safeSubjectCount: safeCount,
            riskSubjectCount: riskCount,
            subjects: updatedSubjects,
          };
        });
      } else {
        showToast(res.message || "Failed to update attendance.");
      }
    });
  };

  const handleSaveEdit = () => {
    if (!editingSubject) return;
    const att = parseInt(editAttended, 10);
    const tot = parseInt(editTotal, 10);
    if (isNaN(att) || isNaN(tot) || att < 0 || tot < att) {
      showToast("Invalid attendance numbers. Attended cannot exceed total.");
      return;
    }

    startTransition(async () => {
      const res = await updateSubjectAttendanceAction({
        subjectId: editingSubject.id,
        attended: att,
        total: tot,
      });

      if (res.success && res.data) {
        showToast(`Updated ${editingSubject.subject}!`);
        setEditingSubject(null);
        setData((prev) => {
          const updated = prev.subjects.map((s) =>
            s.id === res.data!.id ? res.data! : s
          );
          const totalAttended = updated.reduce((acc, s) => acc + s.attended, 0);
          const totalConducted = updated.reduce((acc, s) => acc + s.total, 0);
          const overallPercentage =
            totalConducted === 0 ? 100 : Math.round((totalAttended / totalConducted) * 100);
          return {
            ...prev,
            overallPercentage,
            totalAttended,
            totalConducted,
            safeSubjectCount: updated.filter((s) => s.status !== "DANGER").length,
            riskSubjectCount: updated.filter((s) => s.status === "DANGER").length,
            subjects: updated,
          };
        });
      } else {
        showToast(res.message || "Failed to update.");
      }
    });
  };

  const handleAddSubject = () => {
    const att = parseInt(newAttended, 10);
    const tot = parseInt(newTotal, 10);
    if (!newSubjectName.trim()) {
      showToast("Please enter a subject name.");
      return;
    }
    if (isNaN(att) || isNaN(tot) || att < 0 || tot < 1 || att > tot) {
      showToast("Invalid numbers. Attended cannot exceed total classes.");
      return;
    }

    startTransition(async () => {
      const res = await addSubjectAttendanceAction({
        subject: newSubjectName.trim(),
        code: newSubjectCode.trim() || undefined,
        attended: att,
        total: tot,
        targetPercentage: 75,
      });

      if (res.success && res.data) {
        showToast(`Added ${newSubjectName}!`);
        setIsAddModalOpen(false);
        setNewSubjectName("");
        setNewSubjectCode("");
        setData((prev) => {
          const updated = [...prev.subjects, res.data!];
          const totalAttended = updated.reduce((acc, s) => acc + s.attended, 0);
          const totalConducted = updated.reduce((acc, s) => acc + s.total, 0);
          const overallPercentage =
            totalConducted === 0 ? 100 : Math.round((totalAttended / totalConducted) * 100);
          return {
            ...prev,
            overallPercentage,
            totalAttended,
            totalConducted,
            safeSubjectCount: updated.filter((s) => s.status !== "DANGER").length,
            riskSubjectCount: updated.filter((s) => s.status === "DANGER").length,
            subjects: updated,
          };
        });
      }
    });
  };

  const handleDeleteSubject = (id: string, name: string) => {
    if (!confirm(`Remove ${name} from your attendance tracker?`)) return;
    startTransition(async () => {
      const res = await deleteSubjectAttendanceAction(id);
      if (res.success) {
        showToast(`Removed ${name}.`);
        setData((prev) => {
          const updated = prev.subjects.filter((s) => s.id !== id);
          const totalAttended = updated.reduce((acc, s) => acc + s.attended, 0);
          const totalConducted = updated.reduce((acc, s) => acc + s.total, 0);
          const overallPercentage =
            totalConducted === 0 ? 100 : Math.round((totalAttended / totalConducted) * 100);
          return {
            ...prev,
            overallPercentage,
            totalAttended,
            totalConducted,
            safeSubjectCount: updated.filter((s) => s.status !== "DANGER").length,
            riskSubjectCount: updated.filter((s) => s.status === "DANGER").length,
            subjects: updated,
          };
        });
      }
    });
  };

  // Simulated overall calculation
  const simulatedTotal = data.totalConducted + simulatedBunks;
  const simulatedPercentage =
    simulatedTotal === 0
      ? 100
      : Math.round((data.totalAttended / simulatedTotal) * 100);
  const isSimulationSafe = simulatedPercentage >= 75;

  const isSafeOverall = data.overallPercentage >= 75;

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 p-4 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold shadow-xl border border-zinc-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Hero Overview Banner (75% Attendance Guard) */}
      <section className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-indigo-200/60 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-sky-50/50 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-zinc-950 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-indigo-600 text-white">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                College 75% Attendance Guard
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Attendance & Bunk Calculator
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xl">
              Track your classes against the strict 75% college rule. Calculate safe bunks or required recovery classes to avoid exam debarment.
            </p>
          </div>

          {/* Big Circular Percentage Gauge */}
          <div className="flex items-center gap-5 p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 shadow-xs shrink-0">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-zinc-200 dark:text-zinc-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={isSafeOverall ? "text-emerald-500" : "text-rose-500"}
                  strokeDasharray={`${data.overallPercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-extrabold font-mono text-zinc-900 dark:text-zinc-50">
                  {data.overallPercentage}%
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <Badge
                variant={isSafeOverall ? "success" : "destructive"}
                className="text-xs"
              >
                {isSafeOverall ? "Safe Zone 🎉" : "Debar Risk ⚠️"}
              </Badge>
              <p className="text-xs text-zinc-500">
                {data.totalAttended} of {data.totalConducted} classes attended
              </p>
              <p className="text-[11px] text-zinc-400">
                Target: {data.targetPercentage}% Universal Rule
              </p>
            </div>
          </div>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-zinc-200/80 dark:border-zinc-800">
          <div className="p-3 rounded-xl bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50">
            <span className="text-[11px] text-zinc-400 block font-medium">Safe Subjects (≥75%)</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {data.safeSubjectCount} Courses
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50">
            <span className="text-[11px] text-zinc-400 block font-medium">At-Risk Subjects (&lt;75%)</span>
            <span className="text-lg font-bold text-rose-600 dark:text-rose-400">
              {data.riskSubjectCount} Courses
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-zinc-400 block font-medium">Total Semester Sessions</span>
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {data.totalConducted} Classes
              </span>
            </div>
            <Button
              size="sm"
              variant="gradient"
              onClick={() => setIsAddModalOpen(true)}
              className="gap-1 text-xs min-h-[36px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Subject</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Interactive Bunk Simulator Card */}
      <Card className="border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base">Interactive Bunk Simulator</CardTitle>
              <p className="text-xs text-zinc-500">
                Test how missing upcoming classes impacts your aggregate semester percentage.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                If you miss next{" "}
                <span className="text-indigo-600 dark:text-indigo-400 font-bold font-mono">
                  {simulatedBunks}
                </span>{" "}
                classes this week:
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSimulatedBunks((b) => Math.max(0, b - 1))}
                  className="w-8 h-8 rounded-lg border border-zinc-300 dark:border-zinc-700 flex items-center justify-center font-bold text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 touch-manipulation"
                >
                  -
                </button>
                <span className="font-mono font-bold text-base px-2">{simulatedBunks}</span>
                <button
                  type="button"
                  onClick={() => setSimulatedBunks((b) => b + 1)}
                  className="w-8 h-8 rounded-lg border border-zinc-300 dark:border-zinc-700 flex items-center justify-center font-bold text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 touch-manipulation"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-zinc-400">Projected Attendance</p>
                <p
                  className={cn(
                    "text-2xl font-extrabold font-mono",
                    isSimulationSafe ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  )}
                >
                  {simulatedPercentage}%
                </p>
              </div>
              <Badge
                variant={isSimulationSafe ? "success" : "destructive"}
                className="text-xs py-1"
              >
                {isSimulationSafe ? "Still Safe (≥75%)" : "Debarred (<75%)"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject-Wise Attendance Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Subject-Wise Attendance Breakdown
            </h2>
            <p className="text-xs text-zinc-500">
              Tap + Present or + Missed to record today&apos;s lectures instantly.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.subjects.map((sub) => {
            const isDanger = sub.status === "DANGER";
            const isBorderline = sub.status === "BORDERLINE";

            return (
              <Card
                key={sub.id}
                className={cn(
                  "border transition-all flex flex-col justify-between",
                  isDanger
                    ? "border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10"
                    : isBorderline
                    ? "border-amber-300 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10"
                    : "border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-bold truncate max-w-[220px]">
                          {sub.subject}
                        </CardTitle>
                        {sub.code && (
                          <Badge variant="secondary" className="text-[10px] py-0 font-mono">
                            {sub.code}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {sub.attended} attended / {sub.total} held
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "text-lg font-extrabold font-mono",
                          isDanger
                            ? "text-rose-600 dark:text-rose-400"
                            : isBorderline
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        )}
                      >
                        {sub.percentage}%
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSubject(sub);
                          setEditAttended(sub.attended.toString());
                          setEditTotal(sub.total.toString());
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 touch-manipulation"
                        title="Edit numbers"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden mt-3">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        isDanger ? "bg-rose-500" : isBorderline ? "bg-amber-500" : "bg-emerald-500"
                      )}
                      style={{ width: `${Math.min(100, sub.percentage)}%` }}
                    />
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  {/* Bunk Advice Pill */}
                  <div
                    className={cn(
                      "p-2.5 rounded-xl text-xs font-medium flex items-center gap-2",
                      isDanger
                        ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20"
                        : isBorderline
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                    )}
                  >
                    {isDanger ? (
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    )}
                    <span className="leading-tight">{sub.bunkAdvice}</span>
                  </div>

                  {/* Quick Attendance Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickMark(sub.subject, "PRESENT")}
                      disabled={isPending}
                      className="border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs min-h-[44px] gap-1.5 touch-manipulation"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>+ Present</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickMark(sub.subject, "ABSENT")}
                      disabled={isPending}
                      className="border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs min-h-[44px] gap-1.5 touch-manipulation"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>+ Missed</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Edit Subject Modal */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Update Attendance: {editingSubject.subject}
            </h3>
            <p className="text-xs text-zinc-500">
              Synchronize attended and conducted classes with your university ERP portal.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Classes Attended
                </label>
                <Input
                  type="number"
                  value={editAttended}
                  onChange={(e) => setEditAttended(e.target.value)}
                  min="0"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Total Held
                </label>
                <Input
                  type="number"
                  value={editTotal}
                  onChange={(e) => setEditTotal(e.target.value)}
                  min="1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteSubject(editingSubject.id, editingSubject.subject)}
                className="text-rose-600 hover:bg-rose-50 text-xs gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingSubject(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={isPending}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Add New Course / Lab
            </h3>
            <p className="text-xs text-zinc-500">
              Add an elective, core subject, or laboratory session to your attendance tracker.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Course Name
                </label>
                <Input
                  placeholder="e.g. Machine Learning"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Subject Code (Optional)
                </label>
                <Input
                  placeholder="e.g. CS-306"
                  value={newSubjectCode}
                  onChange={(e) => setNewSubjectCode(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Attended
                  </label>
                  <Input
                    type="number"
                    value={newAttended}
                    onChange={(e) => setNewAttended(e.target.value)}
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Total Classes
                  </label>
                  <Input
                    type="number"
                    value={newTotal}
                    onChange={(e) => setNewTotal(e.target.value)}
                    min="1"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="gradient"
                size="sm"
                onClick={handleAddSubject}
                disabled={isPending}
              >
                Add Subject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
