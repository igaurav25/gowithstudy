export default function ProjectsLoading() {
  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 pb-20">
      <div className="h-16 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="w-32 h-7 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="w-24 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div className="space-y-2">
            <div className="w-72 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="w-96 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-56 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="w-36 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3"
            >
              <div className="w-24 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="w-16 h-7 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Filter bar skeleton */}
        <div className="flex items-center gap-2 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="w-28 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse shrink-0"
            />
          ))}
        </div>

        {/* Project grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 space-y-4 min-h-[260px]"
            >
              <div className="flex items-center justify-between">
                <div className="w-28 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="w-20 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              </div>
              <div className="w-3/4 h-6 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="w-full h-12 rounded bg-zinc-200/60 dark:bg-zinc-800/60 animate-pulse" />
              <div className="w-full h-3 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
