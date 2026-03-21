export default function RecordingsLoading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 md:p-6 lg:p-8 font-sans">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="size-10 rounded-xl bg-blue-600/20 animate-pulse" />
        <div className="space-y-1.5">
          <div className="h-5 w-28 bg-slate-200 animate-pulse rounded" />
          <div className="h-3 w-52 bg-slate-100 animate-pulse rounded" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="size-4 bg-slate-200 animate-pulse rounded" />
          <div className="h-9 w-44 bg-slate-200 animate-pulse rounded-lg" />
        </div>
      </div>

      {/* Player + Events */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* Left column: Player + Day nav */}
        <div className="flex-1 min-w-0">

          {/* Player */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Video area */}
            <div className="w-full aspect-video bg-slate-100 animate-pulse" />
            {/* Player footer */}
            <div className="px-4 py-2.5 flex items-center gap-4 border-t border-slate-100 bg-slate-50">
              <div className="h-3 w-16 bg-slate-200 animate-pulse rounded" />
              <div className="h-3 w-24 bg-slate-100 animate-pulse rounded" />
              <div className="h-3 w-14 bg-slate-100 animate-pulse rounded" />
              <div className="ml-auto h-3 w-40 bg-slate-100 animate-pulse rounded" />
            </div>
          </div>

          {/* Day nav + timeline bar card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mt-5 space-y-5">
            {/* Date row */}
            <div className="flex items-center gap-3">
              <div className="size-7 bg-slate-100 animate-pulse rounded-lg" />
              <div className="flex items-center gap-2">
                <div className="size-4 bg-blue-200 animate-pulse rounded" />
                <div className="h-4 w-16 bg-slate-200 animate-pulse rounded" />
                <div className="h-3 w-32 bg-slate-100 animate-pulse rounded" />
              </div>
              <div className="size-7 bg-slate-100 animate-pulse rounded-lg" />
              <div className="size-7 bg-slate-100 animate-pulse rounded-lg" />
              <div className="ml-auto flex items-center gap-5">
                <div className="h-3 w-24 bg-slate-100 animate-pulse rounded" />
                <div className="h-3 w-20 bg-slate-100 animate-pulse rounded" />
              </div>
            </div>

            {/* Timeline bar */}
            <div className="space-y-1.5">
              <div className="h-9 bg-slate-100 animate-pulse rounded-lg" />
              <div className="h-2 bg-slate-100 animate-pulse rounded" />
              <div className="h-4" />
              {/* Legend */}
              <div className="flex items-center gap-4">
                <div className="h-3 w-20 bg-slate-100 animate-pulse rounded" />
                <div className="h-3 w-20 bg-slate-100 animate-pulse rounded" />
                <div className="h-3 w-16 bg-slate-100 animate-pulse rounded" />
              </div>
            </div>
          </div>

        </div>

        {/* Events panel */}
        <div className="lg:w-72 shrink-0 flex flex-col gap-3">

          {/* Filter bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm space-y-2">
            <div className="h-3 w-20 bg-slate-100 animate-pulse rounded" />
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-6 w-12 bg-slate-100 animate-pulse rounded-lg" />
              ))}
              <div className="ml-auto h-6 w-24 bg-slate-100 animate-pulse rounded-lg" />
            </div>
          </div>

          {/* Event list */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <div className="size-4 bg-amber-200 animate-pulse rounded" />
              <div className="h-4 w-14 bg-slate-200 animate-pulse rounded" />
              <div className="ml-auto h-3 w-10 bg-slate-100 animate-pulse rounded" />
            </div>
            {/* Rows */}
            <div className="p-4 space-y-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2.5 px-0 py-1">
                  <div className="size-2 rounded-full bg-slate-200 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="h-3 w-14 bg-slate-200 animate-pulse rounded" />
                      <div className="h-3 w-10 bg-slate-100 animate-pulse rounded" />
                    </div>
                    <div className="h-2.5 w-20 bg-slate-100 animate-pulse rounded" />
                  </div>
                  <div className="size-3.5 bg-slate-100 animate-pulse rounded shrink-0" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
