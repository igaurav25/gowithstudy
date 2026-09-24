export default function NotificationsLoading() {
  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 pb-20">
      <div className="h-16 border-b border-zinc-200/80 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
          <div className="space-y-2">
            <div className="h-8 w-60 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="h-4 w-96 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-28 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="h-9 w-28 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>
        </div>

        {/* Stats Bar Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2"
            >
              <div className="h-4 w-20 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              <div className="h-7 w-12 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-8 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse"
            />
          ))}
        </div>

        {/* Feed Items Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="h-3 w-4/5 rounded bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
                <div className="h-3 w-1/4 rounded bg-zinc-100 dark:bg-zinc-800/40 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
