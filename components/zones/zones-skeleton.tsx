import { Shield } from "lucide-react";

export function ZonesSkeleton() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0a0a0a] text-white p-4 md:p-6 lg:p-8 font-sans">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#18ffbe]/10 p-2">
              <Shield className="size-6 text-[#18ffbe]/30" />
            </div>
            <div className="h-8 w-52 bg-white/[0.08] animate-pulse rounded-md" />
          </div>
          <div className="h-3.5 w-80 bg-white/[0.05] animate-pulse rounded mt-2" />
        </div>
        <div className="h-9 w-36 bg-white/[0.06] animate-pulse rounded-full" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">

        {/* Left — Draw zone panel */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">

            {/* Canvas area */}
            <div className="w-full aspect-video bg-white/[0.04] animate-pulse" />

            {/* Controls */}
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 flex-1 bg-white/[0.06] animate-pulse rounded-lg" />
                <div className="h-9 w-28 bg-white/[0.06] animate-pulse rounded-lg" />
              </div>
              <div className="h-9 w-full bg-white/[0.06] animate-pulse rounded-lg" />
              <div className="flex items-center gap-3">
                <div className="size-8 bg-white/[0.06] animate-pulse rounded-full" />
                <div className="h-9 flex-1 bg-white/[0.06] animate-pulse rounded-lg" />
                <div className="h-9 flex-1 bg-white/[0.06] animate-pulse rounded-lg" />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className="h-9 w-24 bg-white/[0.06] animate-pulse rounded-lg" />
                <div className="h-9 w-24 bg-white/[0.06] animate-pulse rounded-lg" />
                <div className="ml-auto h-9 w-32 bg-[#18ffbe]/10 animate-pulse rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Right — Zone list */}
        <div className="xl:col-span-5 flex flex-col">

          {/* Camera filter */}
          <div className="mb-4 space-y-1.5">
            <div className="h-3 w-24 bg-white/[0.08] animate-pulse rounded" />
            <div className="h-9 w-full bg-white/[0.06] animate-pulse rounded-md" />
          </div>

          {/* Zone cards */}
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-white/[0.06] rounded-xl bg-white/[0.03] overflow-hidden">
                <div className="px-4 py-3 flex items-center gap-3 border-b border-white/[0.05]">
                  <div className="size-3 rounded-full bg-white/[0.08] animate-pulse" />
                  <div className="h-4 w-32 bg-white/[0.08] animate-pulse rounded" />
                  <div className="ml-auto h-3 w-16 bg-white/[0.06] animate-pulse rounded" />
                  <div className="size-6 bg-white/[0.06] animate-pulse rounded" />
                </div>
                <div className="px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-20 bg-white/[0.06] animate-pulse rounded" />
                    <div className="h-3 w-24 bg-white/[0.06] animate-pulse rounded" />
                  </div>
                  <div className="h-3 w-40 bg-white/[0.06] animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
