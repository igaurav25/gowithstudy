export default function TimetableLoading() {
  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 pb-20">
      {/* Top Bar Skeleton */}
      <div className="h-16 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="w-32 h-7 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="w-24 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Title, View Selector & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="w-56 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="w-80 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-28 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="w-28 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="w-32 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>
        </div>

        {/* Schedule Grid / Agenda Skeleton */}
        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            ))}
          </div>
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-800/40 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
