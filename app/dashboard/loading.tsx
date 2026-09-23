export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
      {/* Header skeleton */}
      <div className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 flex items-center justify-between px-6">
        <div className="w-32 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="flex gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="w-9 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="w-28 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 w-full space-y-8 flex-1">
        {/* Banner skeleton */}
        <div className="h-44 rounded-3xl bg-zinc-200/70 dark:bg-zinc-900/60 animate-pulse" />

        {/* Quick actions skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-zinc-200/60 dark:bg-zinc-900/40 animate-pulse" />
          ))}
        </div>

        {/* Widgets skeleton grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-72 rounded-2xl bg-zinc-200/60 dark:bg-zinc-900/40 animate-pulse" />
          <div className="h-72 rounded-2xl bg-zinc-200/60 dark:bg-zinc-900/40 animate-pulse" />
          <div className="h-72 rounded-2xl bg-zinc-200/60 dark:bg-zinc-900/40 animate-pulse" />
          <div className="h-72 rounded-2xl bg-zinc-200/60 dark:bg-zinc-900/40 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
