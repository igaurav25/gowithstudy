export default function AILoading() {
  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 pb-12 flex flex-col">
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

      {/* Main Container Skeleton */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 flex-1 w-full flex flex-col justify-center">
        <div className="h-[calc(100vh-8.5rem)] max-w-5xl mx-auto w-full rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col overflow-hidden">
          {/* Header Skeleton */}
          <div className="p-4 sm:px-6 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="space-y-1.5">
                <div className="w-36 h-5 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="w-24 h-3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              </div>
            </div>
            <div className="w-48 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>

          {/* Chat Stream Skeleton */}
          <div className="flex-1 p-6 space-y-4">
            <div className="w-3/4 h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
            <div className="w-1/2 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 ml-auto animate-pulse" />
            <div className="w-4/5 h-32 rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
          </div>

          {/* Bottom Bar Skeleton */}
          <div className="p-4 border-t border-zinc-200/80 dark:border-zinc-800 space-y-3">
            <div className="flex gap-2">
              <div className="w-28 h-7 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="w-32 h-7 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            </div>
            <div className="w-full h-12 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
}
