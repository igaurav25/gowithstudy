"use client";

import * as React from "react";
import { StudentProfileData } from "@/services/profile-service";
import {
  updateProfileAction,
  changePasswordAction,
  updatePreferencesAction,
} from "@/features/profile/actions";
import { ActionResult } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  User,
  Shield,
  Bell,
  KeyRound,
  GraduationCap,
  Save,
  CheckCircle2,
  Code2,
  Globe,
  Sparkles,
  Lock,
} from "lucide-react";

export function ProfileEditor({ initialData }: { initialData: StudentProfileData }) {
  const [activeTab, setActiveTab] = React.useState<"profile" | "account" | "security" | "preferences">("profile");

  // Profile form state
  const [profilePending, startProfileTransition] = React.useTransition();
  const [profileResult, setProfileResult] = React.useState<ActionResult | null>(null);

  // Password form state
  const [passPending, startPassTransition] = React.useTransition();
  const [passResult, setPassResult] = React.useState<ActionResult | null>(null);

  // Prefs form state
  const [prefPending, startPrefTransition] = React.useTransition();
  const [prefResult, setPrefResult] = React.useState<ActionResult | null>(null);

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startProfileTransition(async () => {
      const res = await updateProfileAction(null, formData);
      setProfileResult(res);
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startPassTransition(async () => {
      const res = await changePasswordAction(null, formData);
      setPassResult(res);
      if (res.success) form.reset();
    });
  };

  const handlePrefSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startPrefTransition(async () => {
      const res = await updatePreferencesAction(null, formData);
      setPrefResult(res);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Sidebar Navigation */}
      <aside className="lg:col-span-3 space-y-2">
        <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 via-violet-600 to-sky-500 text-white font-bold text-xl flex items-center justify-center mx-auto shadow-md shadow-indigo-500/20">
            {initialData.name[0]}
          </div>
          <h3 className="mt-3 font-bold text-base text-zinc-900 dark:text-zinc-100">{initialData.name}</h3>
          <p className="text-xs text-zinc-500">{initialData.email}</p>
          <div className="mt-2.5">
            <Badge variant="purple" className="text-[10px]">
              {initialData.role}
            </Badge>
          </div>
        </div>

        <nav className="space-y-1">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
              activeTab === "profile"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Details</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("account")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
              activeTab === "account"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Account & College</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
              activeTab === "security"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Security & Password</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preferences")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
              activeTab === "preferences"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Preferences</span>
          </button>
        </nav>
      </aside>

      {/* Main Tab Panel */}
      <section className="lg:col-span-9">
        {/* TAB 1: PROFILE DETAILS */}
        {activeTab === "profile" && (
          <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle>Personal & Academic Profile</CardTitle>
              <CardDescription>
                Customize your public student information, skills, and portfolio links.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-5">
                {profileResult?.message && (
                  <div
                    className={`p-3.5 rounded-xl text-sm font-medium border ${
                      profileResult.success
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {profileResult.message}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Full Name
                    </label>
                    <Input
                      name="name"
                      defaultValue={initialData.name}
                      required
                      error={profileResult?.errors?.name}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      College / University
                    </label>
                    <Input
                      name="college"
                      defaultValue={initialData.college}
                      required
                      error={profileResult?.errors?.college}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Course & Branch
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        name="course"
                        defaultValue={initialData.course}
                        required
                        error={profileResult?.errors?.course}
                      />
                      <Input
                        name="branch"
                        defaultValue={initialData.branch}
                        required
                        error={profileResult?.errors?.branch}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Year
                    </label>
                    <Input
                      name="year"
                      type="number"
                      min={1}
                      max={5}
                      defaultValue={initialData.year}
                      required
                      error={profileResult?.errors?.year}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Semester
                    </label>
                    <Input
                      name="semester"
                      type="number"
                      min={1}
                      max={10}
                      defaultValue={initialData.semester}
                      required
                      error={profileResult?.errors?.semester}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Bio / Headline
                  </label>
                  <textarea
                    name="bio"
                    rows={3}
                    defaultValue={initialData.bio}
                    placeholder="Tell your classmates about your technical interests..."
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Skills (Comma separated)
                  </label>
                  <Input
                    name="skills"
                    defaultValue={initialData.skills.join(", ")}
                    placeholder="React, Next.js, TypeScript, PostgreSQL, DSA"
                  />
                </div>

                {/* Social Links */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Portfolio & Social Links
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="relative">
                      <Input
                        name="github"
                        defaultValue={initialData.github}
                        placeholder="https://github.com/username"
                      />
                    </div>
                    <div className="relative">
                      <Input
                        name="linkedin"
                        defaultValue={initialData.linkedin}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                    <div className="relative">
                      <Input
                        name="portfolio"
                        defaultValue={initialData.portfolio}
                        placeholder="https://yourportfolio.dev"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <Button type="submit" variant="gradient" isLoading={profilePending}>
                    <Save className="w-4 h-4 mr-1.5" />
                    <span>Save Profile Changes</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* TAB 2: ACCOUNT & COLLEGE */}
        {activeTab === "account" && (
          <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
              <CardDescription>
                System identification and institutional account standing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                  <span className="text-xs font-semibold text-zinc-500">User Identification ID</span>
                  <p className="mt-1 font-mono text-xs text-zinc-800 dark:text-zinc-200">{initialData.id}</p>
                </div>
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                  <span className="text-xs font-semibold text-zinc-500">Registered Email</span>
                  <p className="mt-1 font-mono text-xs text-zinc-800 dark:text-zinc-200">{initialData.email}</p>
                </div>
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                  <span className="text-xs font-semibold text-zinc-500">Email Verification Status</span>
                  <p className="mt-1 text-sm font-semibold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    Verified College Student
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                  <span className="text-xs font-semibold text-zinc-500">System Role</span>
                  <p className="mt-1 text-sm font-bold text-indigo-600 dark:text-indigo-400">{initialData.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 3: SECURITY & PASSWORD */}
        {activeTab === "security" && (
          <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Change password and manage credential security.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                {passResult?.message && (
                  <div
                    className={`p-3.5 rounded-xl text-sm font-medium border ${
                      passResult.success
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {passResult.message}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Current Password
                  </label>
                  <Input
                    name="currentPassword"
                    type="password"
                    placeholder="Enter current password"
                    required
                    error={passResult?.errors?.currentPassword}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    New Password
                  </label>
                  <Input
                    name="newPassword"
                    type="password"
                    placeholder="At least 8 chars (upper, lower, number, symbol)"
                    required
                    error={passResult?.errors?.newPassword}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <Input
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    required
                    error={passResult?.errors?.confirmPassword}
                  />
                </div>

                <Button type="submit" variant="gradient" isLoading={passPending}>
                  <KeyRound className="w-4 h-4 mr-1.5" />
                  <span>Update Password</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* TAB 4: PREFERENCES */}
        {activeTab === "preferences" && (
          <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle>Notification & Display Preferences</CardTitle>
              <CardDescription>
                Control alerts for assignment deadlines and placement opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePrefSubmit} className="space-y-5">
                {prefResult?.message && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                    {prefResult.message}
                  </div>
                )}

                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 cursor-pointer">
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      defaultChecked={initialData.preferences.emailNotifications}
                      className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Email Notifications</p>
                      <p className="text-xs text-zinc-500">Receive important announcements and weekly activity digests.</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 cursor-pointer">
                    <input
                      type="checkbox"
                      name="assignmentReminders"
                      defaultChecked={initialData.preferences.assignmentReminders}
                      className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Assignment Deadlines</p>
                      <p className="text-xs text-zinc-500">Alerts when pending assignments are due within 24 hours.</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 cursor-pointer">
                    <input
                      type="checkbox"
                      name="placementAlerts"
                      defaultChecked={initialData.preferences.placementAlerts}
                      className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Placement & Job Alerts</p>
                      <p className="text-xs text-zinc-500">Notifications on new on-campus and off-campus hiring drives.</p>
                    </div>
                  </label>
                </div>

                <div className="pt-2">
                  <Button type="submit" variant="gradient" isLoading={prefPending}>
                    <Save className="w-4 h-4 mr-1.5" />
                    <span>Save Preferences</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
