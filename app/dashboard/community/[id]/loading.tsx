export default function PostDetailLoading() {
  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 pb-20">
      <div className="h-16 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="w-36 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="space-y-2">
              <div className="w-40 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="w-28 h-3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            </div>
          </div>
          <div className="w-3/4 h-8 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="space-y-2">
            <div className="w-full h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="w-full h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="w-2/3 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
