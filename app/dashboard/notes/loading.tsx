export default function NotesLoading() {
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
        {/* Title & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="w-56 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="w-80 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>
          <div className="w-36 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3"
            >
              <div className="w-20 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="w-12 h-7 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Filters Bar */}
        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
          <div className="w-full h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-20 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse shrink-0"
              />
            ))}
          </div>
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="w-24 h-5 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="w-16 h-5 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              </div>
              <div className="w-3/4 h-6 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="w-full h-12 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between">
                <div className="w-20 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="w-24 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
