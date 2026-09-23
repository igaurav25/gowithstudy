"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MAX_PDF_FILE_SIZE,
  STANDARD_CSE_SUBJECTS,
  NOTE_CATEGORIES,
  NOTE_STATUSES,
  CreateNoteInput,
  NoteStatus,
} from "@/schemas/notes";
import {
  UploadCloud,
  FileText,
  X,
  AlertCircle,
  Check,
  Plus,
  Loader2,
} from "lucide-react";

interface UploadNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (noteData: CreateNoteInput) => Promise<boolean>;
}

export function UploadNoteModal({
  isOpen,
  onClose,
  onSubmit,
}: UploadNoteModalProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  // Form states
  const [title, setTitle] = React.useState("");
  const [subject, setSubject] = React.useState<string>(STANDARD_CSE_SUBJECTS[0]);
  const [customSubject, setCustomSubject] = React.useState("");
  const [isCustomSubject, setIsCustomSubject] = React.useState(false);
  const [category, setCategory] = React.useState<string>(NOTE_CATEGORIES[0]);
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<NoteStatus>("IN_PROGRESS");

  // Tags state
  const [tags, setTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState("");

  // Submission / Upload progress
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Reset form
  const resetForm = () => {
    setSelectedFile(null);
    setFileError(null);
    setTitle("");
    setSubject(STANDARD_CSE_SUBJECTS[0]);
    setCustomSubject("");
    setIsCustomSubject(false);
    setCategory(NOTE_CATEGORIES[0]);
    setDescription("");
    setStatus("IN_PROGRESS");
    setTags([]);
    setTagInput("");
    setSubmitError(null);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  // Validate and set file
  const handleFile = (file: File) => {
    setFileError(null);

    // Validation 1: MIME type and extension
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setFileError("Invalid file type. Please upload a PDF document (.pdf).");
      setSelectedFile(null);
      return;
    }

    // Validation 2: Maximum file size (25MB)
    if (file.size > MAX_PDF_FILE_SIZE) {
      const mbSize = (file.size / (1024 * 1024)).toFixed(1);
      setFileError(
        `File is too large (${mbSize} MB). Maximum allowed size is 25 MB.`
      );
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);

    // Auto-populate title if empty
    if (!title.trim()) {
      const cleanName = file.name
        .replace(/\.pdf$/i, "")
        .replace(/[_-]+/g, " ")
        .trim();
      setTitle(cleanName);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Tag management
  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, "");
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const activeSubject = isCustomSubject ? customSubject.trim() : subject;
    if (!activeSubject) {
      setSubmitError("Please select or enter a subject name.");
      return;
    }

    if (!title.trim()) {
      setSubmitError("Please enter a note title.");
      return;
    }

    setIsSubmitting(true);

    try {
      let fileUrl = "";
      let fileName = selectedFile?.name || "";
      let fileSize = selectedFile?.size || 0;

      // If a real PDF is selected, upload to /api/notes/upload
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await fetch("/api/notes/upload", {
          method: "POST",
          body: formData,
        });

        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok || !uploadJson.success) {
          throw new Error(uploadJson.message || "Failed to upload PDF file.");
        }

        fileUrl = uploadJson.data.fileUrl;
        fileName = uploadJson.data.fileName;
        fileSize = uploadJson.data.fileSize;
      }

      const notePayload: CreateNoteInput = {
        title: title.trim(),
        subject: activeSubject,
        category,
        description: description.trim() || undefined,
        tags,
        status,
        fileUrl,
        fileName,
        fileSize,
      };

      const success = await onSubmit(notePayload);
      if (success) {
        handleClose();
      } else {
        setSubmitError("Failed to save note. Please check the values and try again.");
      }
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Upload Study Material
              </h2>
              <p className="text-xs text-zinc-500">
                Add PDF slides, notes, or cheatsheets to your library
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
          {submitError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* PDF Drag & Drop Zone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              PDF Document
            </label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30"
                  : selectedFile
                  ? "border-emerald-500/60 bg-emerald-50/30 dark:bg-emerald-950/20"
                  : "border-zinc-300 dark:border-zinc-700 hover:border-indigo-400 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />

              {selectedFile ? (
                <div className="flex items-center justify-between gap-4 p-2 bg-white dark:bg-zinc-800/80 rounded-xl border border-zinc-200/80 dark:border-zinc-700">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • PDF Verified
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-zinc-400 hover:text-rose-600 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-2">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      Click to browse
                    </span>{" "}
                    or drag and drop your PDF here
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    PDF files only • Maximum file size 25MB
                  </p>
                </div>
              )}
            </div>

            {fileError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {fileError}
              </p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Note Title <span className="text-rose-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Operating Systems — Process Scheduling & Synchronization"
              required
              className="h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800/50"
            />
          </div>

          {/* Subject & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subject Selection */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Subject <span className="text-rose-500">*</span>
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
                  placeholder="Enter custom course name..."
                  className="h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800/50"
                />
              ) : (
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  aria-label="Select subject"
                  className="w-full h-10 px-3 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {STANDARD_CSE_SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Category Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Document Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Select document category"
                className="w-full h-10 px-3 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {NOTE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Description / Summary (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Key concepts, syllabus unit, or exam importance..."
              className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Tags & Reading Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tag Builder */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Tags (Press Enter to add)
              </label>
              <div className="flex items-center gap-1.5">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="e.g. Deadlocks, Unit-2"
                  className="h-9 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/50"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddTag}
                  className="h-9 px-2 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>

              {tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {tags.map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      className="text-[10px] gap-1 pr-1"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        aria-label={`Remove tag ${t}`}
                        className="hover:text-rose-500"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Reading Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Reading Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as NoteStatus)}
                aria-label="Select initial status"
                className="w-full h-10 px-3 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="READ">Read</option>
              </select>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[130px] gap-2 shadow-md shadow-indigo-500/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Add Material</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
