export default function InternshipsLoading() {
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
        {/* Title, Switcher & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="w-64 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="w-96 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-48 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="w-36 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Filter Bar Skeleton */}
        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-72 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            <div className="w-36 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            <div className="w-36 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          </div>
        </div>

        {/* Kanban Board Columns Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((col) => (
            <div
              key={col}
              className="bg-zinc-100/60 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-3 space-y-3 min-h-[400px]"
            >
              <div className="h-6 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="h-28 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 animate-pulse" />
              <div className="h-28 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
