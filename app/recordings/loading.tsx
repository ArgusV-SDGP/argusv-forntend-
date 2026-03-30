export default function RecordingsLoading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0a0a0a] p-4 md:p-6 lg:p-8 font-sans">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="size-10 rounded-xl bg-[#18ffbe]/10 animate-pulse" />
        <div className="space-y-1.5">
          <div className="h-5 w-28 bg-white/[0.08] animate-pulse rounded" />
          <div className="h-3 w-52 bg-white/[0.05] animate-pulse rounded" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="size-4 bg-white/[0.06] animate-pulse rounded" />
          <div className="h-9 w-44 bg-white/[0.06] animate-pulse rounded-lg" />
        </div>
      </div>

      {/* Player + Events */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* Left column: Player + Day nav */}
        <div className="flex-1 min-w-0">

          {/* Player */}
          <div className="border border-white/[0.08] bg-white/[0.03] rounded-2xl overflow-hidden">
            <div className="w-full aspect-video bg-white/[0.04] animate-pulse" />
            <div className="px-4 py-2.5 flex items-center gap-4 border-t border-white/[0.06] bg-white/[0.02]">
              <div className="h-3 w-16 bg-white/[0.08] animate-pulse rounded" />
              <div className="h-3 w-24 bg-white/[0.06] animate-pulse rounded" />
              <div className="h-3 w-14 bg-white/[0.06] animate-pulse rounded" />
              <div className="ml-auto h-3 w-40 bg-white/[0.06] animate-pulse rounded" />
            </div>
          </div>

          {/* Day nav + timeline bar */}
          <div className="border border-white/[0.08] bg-white/[0.03] rounded-2xl p-5 mt-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="size-7 bg-white/[0.06] animate-pulse rounded-lg" />
              <div className="flex items-center gap-2">
                <div className="size-4 bg-[#18ffbe]/20 animate-pulse rounded" />
                <div className="h-4 w-16 bg-white/[0.08] animate-pulse rounded" />
                <div className="h-3 w-32 bg-white/[0.05] animate-pulse rounded" />
              </div>
              <div className="size-7 bg-white/[0.06] animate-pulse rounded-lg" />
              <div className="size-7 bg-white/[0.06] animate-pulse rounded-lg" />
              <div className="ml-auto flex items-center gap-5">
                <div className="h-3 w-24 bg-white/[0.05] animate-pulse rounded" />
                <div className="h-3 w-20 bg-white/[0.05] animate-pulse rounded" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="h-9 bg-white/[0.06] animate-pulse rounded-lg" />
              <div className="h-2 bg-white/[0.04] animate-pulse rounded" />
              <div className="h-4" />
              <div className="flex items-center gap-4">
                <div className="h-3 w-20 bg-white/[0.05] animate-pulse rounded" />
                <div className="h-3 w-20 bg-white/[0.05] animate-pulse rounded" />
                <div className="h-3 w-16 bg-white/[0.05] animate-pulse rounded" />
              </div>
            </div>
          </div>

        </div>

        {/* Events panel */}
        <div className="lg:w-72 shrink-0 flex flex-col gap-3">

          {/* Filter bar */}
          <div className="border border-white/[0.08] bg-white/[0.03] rounded-xl p-3 space-y-2">
            <div className="h-3 w-20 bg-white/[0.05] animate-pulse rounded" />
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-6 w-12 bg-white/[0.06] animate-pulse rounded-lg" />
              ))}
              <div className="ml-auto h-6 w-24 bg-white/[0.06] animate-pulse rounded-lg" />
            </div>
          </div>

          {/* Event list */}
          <div className="border border-white/[0.08] bg-white/[0.03] rounded-xl overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-white/[0.06] bg-white/[0.02] flex items-center gap-2">
              <div className="size-4 bg-amber-400/20 animate-pulse rounded" />
              <div className="h-4 w-14 bg-white/[0.08] animate-pulse rounded" />
              <div className="ml-auto h-3 w-10 bg-white/[0.05] animate-pulse rounded" />
            </div>
            <div className="p-4 space-y-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2.5 px-0 py-1">
                  <div className="size-2 rounded-full bg-white/[0.08] animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="h-3 w-14 bg-white/[0.08] animate-pulse rounded" />
                      <div className="h-3 w-10 bg-white/[0.06] animate-pulse rounded" />
                    </div>
                    <div className="h-2.5 w-20 bg-white/[0.05] animate-pulse rounded" />
                  </div>
                  <div className="size-3.5 bg-white/[0.05] animate-pulse rounded shrink-0" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
