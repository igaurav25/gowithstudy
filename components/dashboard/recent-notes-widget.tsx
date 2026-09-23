import { RecentNoteItem } from "@/services/dashboard-service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, ArrowRight, Upload } from "lucide-react";
import Link from "next/link";

export function RecentNotesWidget({ notes }: { notes: RecentNoteItem[] }) {
  return (
    <Card className="border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base">Recent Study Materials</CardTitle>
              <CardDescription className="text-xs">
                Uploaded PDFs, lecture slides & notes
              </CardDescription>
            </div>
          </div>
          <Badge variant="purple" className="text-[11px]">
            {notes.length} Documents
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-1">
        {notes.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-500 text-xs">
            <Upload className="w-8 h-8 mx-auto text-indigo-500 mb-2" />
            <p className="font-semibold text-zinc-700 dark:text-zinc-300">No notes uploaded yet.</p>
            <p className="mt-1">Upload your first course PDF to start studying with AI.</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-indigo-500/40 transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                    {note.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500">
                    <span className="font-medium text-indigo-600 dark:text-indigo-400">{note.subject}</span>
                    <span>•</span>
                    <span>{note.fileSize}</span>
                    <span>•</span>
                    <span>{note.pages} Pages</span>
                  </div>
                </div>
              </div>

              <Link href={`/dashboard/ai?noteId=${note.id}`}>
                <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                  <span>Ask AI</span>
                </Button>
              </Link>
            </div>
          ))
        )}

        <div className="pt-2 text-right">
          <Link
            href="/dashboard/notes"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Browse Study Library →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
