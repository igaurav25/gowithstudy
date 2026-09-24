"use client";

import { useState, useMemo } from "react";
import {
  Building2,
  ShieldCheck,
  FileText,
  Calendar,
  Download,
  ExternalLink,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Copy,
  Check,
  BookOpen,
  Award,
  Pin,
  Globe,
  MapPin,
  ChevronDown,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  CollegeItem,
  CollegeNoticeItem,
  CollegeStats,
} from "@/services/college-info-service";
import {
  COLLEGE_INFO_CATEGORIES,
  COLLEGE_INFO_CATEGORY_LABELS,
  CollegeInfoCategory,
} from "@/schemas/college-info";
import { deleteCollegeInfoAction } from "@/features/college-info/actions";
import { CreateCollegeInfoModal } from "./create-college-info-modal";

interface CollegeInfoClientViewProps {
  initialColleges: CollegeItem[];
  initialNotices: CollegeNoticeItem[];
  initialStats: CollegeStats;
  currentCollegeCode: string;
  userRole: "USER" | "MODERATOR" | "ADMIN";
  userCollege?: string;
}

export function CollegeInfoClientView({
  initialColleges,
  initialNotices,
  initialStats,
  currentCollegeCode,
  userRole,
  userCollege,
}: CollegeInfoClientViewProps) {
  const [selectedCollegeCode, setSelectedCollegeCode] = useState(currentCollegeCode || "DTU");
  const [notices, setNotices] = useState<CollegeNoticeItem[]>(initialNotices);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletePendingId, setDeletePendingId] = useState<string | null>(null);

  const canPublish = userRole === "MODERATOR" || userRole === "ADMIN";

  // Current active college
  const activeCollege = useMemo(() => {
    return initialColleges.find((c) => c.code === selectedCollegeCode) || initialColleges[0];
  }, [initialColleges, selectedCollegeCode]);

  // Filtered notices
  const filteredNotices = useMemo(() => {
    return notices.filter((n) => {
      // College match
      if (n.collegeCode !== selectedCollegeCode) return false;

      // Category filter
      if (selectedCategory !== "ALL" && n.category !== selectedCategory) return false;

      // Department filter
      if (selectedDepartment !== "ALL" && n.department !== selectedDepartment && n.department !== "All Departments") {
        return false;
      }

      // Verified only
      if (verifiedOnly && n.verifiedState !== "VERIFIED") return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = n.title.toLowerCase().includes(q);
        const matchContent = n.content.toLowerCase().includes(q);
        const matchRef = n.refNumber?.toLowerCase().includes(q);
        const matchDept = n.department?.toLowerCase().includes(q);
        if (!matchTitle && !matchContent && !matchRef && !matchDept) return false;
      }

      return true;
    });
  }, [notices, selectedCollegeCode, selectedCategory, selectedDepartment, verifiedOnly, searchQuery]);

  // Dynamic stats
  const stats = useMemo(() => {
    const collegeNotices = notices.filter((n) => n.collegeCode === selectedCollegeCode);
    return {
      totalVerified: collegeNotices.filter((n) => n.verifiedState === "VERIFIED").length,
      activeCirculars: collegeNotices.filter((n) => n.category === "CIRCULAR").length,
      examSchedules: collegeNotices.filter((n) => n.category === "EXAM_SCHEDULE").length,
      departmentGuidelines: collegeNotices.filter(
        (n) => n.category === "DEPARTMENT_RESOURCE" || n.category === "ACADEMIC"
      ).length,
    };
  }, [notices, selectedCollegeCode]);

  const handleCopyRef = (refNo: string) => {
    navigator.clipboard.writeText(refNo);
    setCopiedRef(refNo);
    setTimeout(() => setCopiedRef(null), 2500);
  };

  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this official circular?")) return;
    setDeletePendingId(id);
    try {
      const res = await deleteCollegeInfoAction(id);
      if (res.success) {
        setNotices((prev) => prev.filter((n) => n.id !== id));
      } else {
        alert(res.error || "Failed to remove notice");
      }
    } catch {
      alert("Error removing notice");
    } finally {
      setDeletePendingId(null);
    }
  };

  const getCategoryBadgeColor = (cat: CollegeInfoCategory) => {
    switch (cat) {
      case "ACADEMIC":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "CIRCULAR":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "EXAM_SCHEDULE":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "FEE_DEADLINE":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "CAMPUS_FACILITY":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "DEPARTMENT_RESOURCE":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-zinc-700/30 text-zinc-300 border-zinc-700/50";
    }
  };

  return (
    <div className="space-y-6">
      {/* College Switcher & Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Institution Switcher Pills */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Select University
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {initialColleges.map((col) => {
              const isSelected = col.code === selectedCollegeCode;
              return (
                <button
                  key={col.code}
                  onClick={() => {
                    setSelectedCollegeCode(col.code);
                    setSelectedCategory("ALL");
                    setSelectedDepartment("ALL");
                  }}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30 border border-emerald-500/30"
                      : "bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-700/50"
                  }`}
                >
                  <span>{col.code}</span>
                  <span className="text-[10px] opacity-75">({col.city})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active College Details Header */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg uppercase tracking-wider">
                {activeCollege?.code} Verified Campus
              </span>
              {activeCollege?.verifiedDomains?.map((domain) => (
                <span
                  key={domain}
                  className="px-2 py-0.5 text-[11px] font-mono text-zinc-400 bg-zinc-800/80 border border-zinc-700/60 rounded-md flex items-center space-x-1"
                >
                  <Globe className="w-3 h-3 text-zinc-500" />
                  <span>@{domain}</span>
                </span>
              ))}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeCollege?.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                <span>
                  {activeCollege?.city}, {activeCollege?.state}
                </span>
              </div>
              {activeCollege?.websiteUrl && (
                <a
                  href={activeCollege.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-emerald-400 hover:underline"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Action Button */}
          {canPublish && (
            <div className="shrink-0">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-emerald-900/30 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Official Notice</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-center space-x-4 shadow-sm">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-white">
              {stats.totalVerified}
            </div>
            <div className="text-xs text-zinc-400">Verified Notices</div>
          </div>
        </div>

        <div className="p-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-center space-x-4 shadow-sm">
          <div className="p-3 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-white">
              {stats.activeCirculars}
            </div>
            <div className="text-xs text-zinc-400">Official Circulars</div>
          </div>
        </div>

        <div className="p-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-center space-x-4 shadow-sm">
          <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-white">
              {stats.examSchedules}
            </div>
            <div className="text-xs text-zinc-400">Exam Timetables</div>
          </div>
        </div>

        <div className="p-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-center space-x-4 shadow-sm">
          <div className="p-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-white">
              {stats.departmentGuidelines}
            </div>
            <div className="text-xs text-zinc-400">Curricula & Guidelines</div>
          </div>
        </div>
      </div>

      {/* Official Truth Guarantee Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-emerald-300 tracking-wide uppercase">
                Official University Source of Truth
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                Not AI Generated
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">
              All circulars, exam dates, fee concessions, and capstone guidelines are verified against
              official university registries, gazettes, and registrar signatures. Unofficial rumors and AI hallucinations are strictly isolated.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center space-x-2 text-xs text-emerald-400/90 font-mono bg-emerald-950/50 px-3 py-1.5 rounded-lg border border-emerald-500/20">
          <Award className="w-3.5 h-3.5" />
          <span>Gazette Verified</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search circulars, reference numbers (e.g. DTU/COE/2026/0412), topics..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-xs sm:text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Department Filter Dropdown */}
          <div className="flex items-center space-x-3">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="ALL">All Departments</option>
              {activeCollege?.departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Verified Only Switch */}
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`flex items-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border transition ${
                verifiedOnly
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Only</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
              selectedCategory === "ALL"
                ? "bg-white text-black font-semibold shadow-sm"
                : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            All Notices ({notices.filter((n) => n.collegeCode === selectedCollegeCode).length})
          </button>
          {COLLEGE_INFO_CATEGORIES.map((cat) => {
            const count = notices.filter(
              (n) => n.collegeCode === selectedCollegeCode && n.category === cat
            ).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition flex items-center space-x-1.5 ${
                  isSelected
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                <span>{COLLEGE_INFO_CATEGORY_LABELS[cat]}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notices Feed */}
      <div className="space-y-4">
        {filteredNotices.length === 0 ? (
          <div className="p-12 text-center bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3">
            <FileText className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-base font-semibold text-white">No notices found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              No verified documents match your current filter criteria for {activeCollege?.name}.
            </p>
            {(selectedCategory !== "ALL" || selectedDepartment !== "ALL" || searchQuery || verifiedOnly) && (
              <button
                onClick={() => {
                  setSelectedCategory("ALL");
                  setSelectedDepartment("ALL");
                  setSearchQuery("");
                  setVerifiedOnly(false);
                }}
                className="mt-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white rounded-xl transition"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          filteredNotices.map((notice) => {
            const isExpanded = expandedNoticeId === notice.id;
            return (
              <div
                key={notice.id}
                className={`relative rounded-2xl border p-5 sm:p-6 transition-all duration-200 ${
                  notice.isPinned
                    ? "bg-zinc-900/90 border-amber-500/30 shadow-md shadow-amber-950/20"
                    : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                {/* Notice Top Ribbon */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Category */}
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${getCategoryBadgeColor(
                        notice.category
                      )}`}
                    >
                      {COLLEGE_INFO_CATEGORY_LABELS[notice.category]}
                    </span>

                    {/* Department */}
                    {notice.department && (
                      <span className="px-2.5 py-1 text-xs font-medium text-zinc-400 bg-zinc-800/80 border border-zinc-700/60 rounded-lg">
                        {notice.department}
                      </span>
                    )}

                    {/* Pinned Indicator */}
                    {notice.isPinned && (
                      <span className="px-2.5 py-1 text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-lg flex items-center space-x-1">
                        <Pin className="w-3 h-3" />
                        <span>Pinned Notice</span>
                      </span>
                    )}
                  </div>

                  {/* Ref Number & Copy Action */}
                  {notice.refNumber && (
                    <div className="flex items-center space-x-1.5 bg-zinc-800/80 border border-zinc-700/60 rounded-lg px-2.5 py-1 text-xs font-mono text-zinc-300">
                      <span>Ref: {notice.refNumber}</span>
                      <button
                        onClick={() => handleCopyRef(notice.refNumber!)}
                        title="Copy Reference Number"
                        className="text-zinc-400 hover:text-white p-0.5 rounded transition"
                      >
                        {copiedRef === notice.refNumber ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Notice Title & Verification Seal */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                      {notice.title}
                    </h2>

                    {/* Official Source of Truth Badge */}
                    <div className="shrink-0 flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="hidden sm:inline">OFFICIAL SOURCE OF TRUTH</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <p
                    className={`text-xs sm:text-sm text-zinc-300 leading-relaxed ${
                      isExpanded ? "" : "line-clamp-3"
                    }`}
                  >
                    {notice.content}
                  </p>

                  {notice.content.length > 220 && (
                    <button
                      onClick={() => setExpandedNoticeId(isExpanded ? null : notice.id)}
                      className="text-xs font-semibold text-emerald-400 hover:underline inline-flex items-center space-x-1"
                    >
                      <span>{isExpanded ? "Show Less" : "Read Full Directive..."}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Footer Metadata & Actions */}
                <div className="mt-5 pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-zinc-400">
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Verified By */}
                    <div className="flex items-center space-x-1.5 text-zinc-300 font-medium">
                      <Award className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Authorized: {notice.verifiedBy || "University Registry"}</span>
                    </div>

                    {/* Valid Until / Deadline */}
                    {notice.validUntil && (
                      <div className="flex items-center space-x-1.5 text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        <Clock className="w-3 h-3" />
                        <span>
                          Valid until:{" "}
                          {new Date(notice.validUntil).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    )}

                    {/* Published Date */}
                    <div className="text-zinc-500">
                      Gazetted:{" "}
                      {new Date(notice.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>

                  {/* Actions (Download PDF, Admin Delete) */}
                  <div className="flex items-center space-x-2">
                    {notice.officialDocUrl && (
                      <a
                        href={notice.officialDocUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-medium transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Official PDF</span>
                      </a>
                    )}

                    {canPublish && (
                      <button
                        onClick={() => handleDeleteNotice(notice.id)}
                        disabled={deletePendingId === notice.id}
                        title="Remove Circular"
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Circular Modal */}
      <CreateCollegeInfoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        colleges={initialColleges}
        defaultCollegeCode={selectedCollegeCode}
        onSuccess={() => {
          // Soft refresh notices
          window.location.reload();
        }}
      />
    </div>
  );
}
