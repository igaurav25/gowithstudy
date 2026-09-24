"use client";

import { useState } from "react";
import {
  X,
  Building2,
  ShieldCheck,
  FileText,
  Calendar,
  AlertCircle,
  Loader2,
  Pin,
  ExternalLink,
} from "lucide-react";
import {
  COLLEGE_INFO_CATEGORIES,
  COLLEGE_INFO_CATEGORY_LABELS,
  CollegeInfoCategory,
  CreateCollegeInfoInput,
} from "@/schemas/college-info";
import { createCollegeInfoAction } from "@/features/college-info/actions";
import { CollegeItem } from "@/services/college-info-service";

interface CreateCollegeInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  colleges: CollegeItem[];
  defaultCollegeCode?: string;
  onSuccess: () => void;
}

export function CreateCollegeInfoModal({
  isOpen,
  onClose,
  colleges,
  defaultCollegeCode = "DTU",
  onSuccess,
}: CreateCollegeInfoModalProps) {
  const [collegeCode, setCollegeCode] = useState(defaultCollegeCode);
  const [category, setCategory] = useState<CollegeInfoCategory>("CIRCULAR");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [refNumber, setRefNumber] = useState("");
  const [officialDocUrl, setOfficialDocUrl] = useState("");
  const [department, setDepartment] = useState("Computer Science & Engineering");
  const [verifiedBy, setVerifiedBy] = useState("Dean of Academic Affairs, DTU");
  const [validUntil, setValidUntil] = useState("");
  const [isPinned, setIsPinned] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeCollege = colleges.find((c) => c.code === collegeCode) || colleges[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 5) {
      setError("Title must be at least 5 characters long");
      return;
    }

    if (content.trim().length < 20) {
      setError("Content must be at least 20 characters providing full notice details");
      return;
    }

    if (!verifiedBy.trim()) {
      setError("Designated signing authority is mandatory for verified notices");
      return;
    }

    setIsLoading(true);

    try {
      const payload: CreateCollegeInfoInput = {
        collegeCode,
        category,
        title: title.trim(),
        content: content.trim(),
        refNumber: refNumber.trim() || undefined,
        officialDocUrl: officialDocUrl.trim() || undefined,
        department: department.trim() || undefined,
        verifiedBy: verifiedBy.trim(),
        validUntil: validUntil || undefined,
        isPinned,
      };

      const res = await createCollegeInfoAction(payload);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || "Failed to publish verified circular");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Publish Official Circular
              </h2>
              <p className="text-xs text-zinc-400">
                Official University Source of Truth Repository
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Official Verification Guarantee Banner */}
          <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-center space-x-3 text-xs text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              All published notices carry the immutable seal: <strong>OFFICIAL SOURCE OF TRUTH — NOT AI GENERATED</strong> with reference numbering.
            </span>
          </div>

          {/* College and Category row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Target Institution
              </label>
              <select
                value={collegeCode}
                onChange={(e) => {
                  setCollegeCode(e.target.value);
                  const col = colleges.find((c) => c.code === e.target.value);
                  if (col && col.departments.length > 0) {
                    setDepartment(col.departments[0]);
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                {colleges.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Notice Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CollegeInfoCategory)}
                className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                {COLLEGE_INFO_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {COLLEGE_INFO_CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Notice / Circular Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. End-Term Theory Examination Timetable — Even Semester 2026"
              className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Ref Number and Signing Authority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Official Reference Number
              </label>
              <input
                type="text"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                placeholder="e.g. DTU/COE/2026/0412"
                className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Signing Authority *
              </label>
              <input
                type="text"
                required
                value={verifiedBy}
                onChange={(e) => setVerifiedBy(e.target.value)}
                placeholder="e.g. Controller of Examinations, DTU"
                className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          {/* Department and Valid Until */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Applicable Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="All Departments">All Departments</option>
                {activeCollege?.departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Valid Until (Optional Deadline)
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          {/* Official Document URL */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Official Document / PDF URL (Optional)
            </label>
            <input
              type="url"
              value={officialDocUrl}
              onChange={(e) => setOfficialDocUrl(e.target.value)}
              placeholder="https://dtu.ac.in/circulars/exam-timetable-even-2026.pdf"
              className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Content Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Notice Body / Full Resolution *
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste full official notice text, ordinance resolutions, or schedule details..."
              className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-y"
            />
          </div>

          {/* Pinned toggle */}
          <div className="flex items-center space-x-3 p-3 bg-zinc-800/50 border border-zinc-700/60 rounded-xl">
            <input
              type="checkbox"
              id="pin-circular"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 bg-zinc-900 border-zinc-700 focus:ring-emerald-500"
            />
            <label htmlFor="pin-circular" className="text-xs text-zinc-300 cursor-pointer flex items-center space-x-2">
              <Pin className="w-3.5 h-3.5 text-amber-400" />
              <span>Pin this notice to the top of the university repository</span>
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-zinc-800 bg-zinc-900/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition rounded-xl hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center space-x-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-900/30 transition"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Publish Verified Notice</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
