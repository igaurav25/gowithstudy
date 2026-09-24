export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 pb-20">
      <div className="h-16 border-b border-zinc-200/80 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
          <div className="space-y-2">
            <div className="h-8 w-72 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="h-4 w-96 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
          </div>
          <div className="h-9 w-32 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2"
            >
              <div className="h-4 w-24 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              <div className="h-7 w-12 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Content Box Skeleton */}
        <div className="h-96 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 animate-pulse" />
      </main>
    </div>
  );
}
