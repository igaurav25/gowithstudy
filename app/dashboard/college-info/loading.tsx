export default function CollegeInfoLoading() {
  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 pb-20">
      <div className="h-16 border-b border-zinc-800 bg-zinc-900/50" />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-6 animate-pulse">
          {/* Hero Banner skeleton */}
          <div className="h-48 rounded-2xl bg-zinc-900 border border-zinc-800" />

          {/* Stats skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="h-24 rounded-2xl bg-zinc-900 border border-zinc-800" />
            <div className="h-24 rounded-2xl bg-zinc-900 border border-zinc-800" />
            <div className="h-24 rounded-2xl bg-zinc-900 border border-zinc-800" />
            <div className="h-24 rounded-2xl bg-zinc-900 border border-zinc-800" />
          </div>

          {/* Truth guarantee banner skeleton */}
          <div className="h-28 rounded-2xl bg-zinc-900 border border-zinc-800" />

          {/* Search bar skeleton */}
          <div className="h-14 rounded-2xl bg-zinc-900 border border-zinc-800" />

          {/* Cards skeleton */}
          <div className="space-y-4">
            <div className="h-40 rounded-2xl bg-zinc-900 border border-zinc-800" />
            <div className="h-40 rounded-2xl bg-zinc-900 border border-zinc-800" />
            <div className="h-40 rounded-2xl bg-zinc-900 border border-zinc-800" />
          </div>
        </div>
      </main>
    </div>
  );
}
