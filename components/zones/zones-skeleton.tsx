import { Shield } from "lucide-react";

export function ZonesSkeleton() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-800 p-4 md:p-6 lg:p-8 font-sans">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Shield className="size-8 text-blue-500" />
            <div className="h-8 w-52 bg-slate-200 animate-pulse rounded-md" />
          </div>
          <div className="h-3.5 w-80 bg-slate-100 animate-pulse rounded mt-2" />
        </div>
        <div className="h-9 w-36 bg-slate-200 animate-pulse rounded-full" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">

        {/* Left — Draw zone panel */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

            {/* Canvas area */}
            <div className="w-full aspect-video bg-slate-100 animate-pulse" />

            {/* Controls */}
            <div className="p-5 space-y-4">
              {/* Camera select row */}
              <div className="flex items-center gap-3">
                <div className="h-9 flex-1 bg-slate-100 animate-pulse rounded-lg" />
                <div className="h-9 w-28 bg-slate-100 animate-pulse rounded-lg" />
              </div>

              {/* Zone name input */}
              <div className="h-9 w-full bg-slate-100 animate-pulse rounded-lg" />

              {/* Color + type row */}
              <div className="flex items-center gap-3">
                <div className="size-8 bg-slate-100 animate-pulse rounded-full" />
                <div className="h-9 flex-1 bg-slate-100 animate-pulse rounded-lg" />
                <div className="h-9 flex-1 bg-slate-100 animate-pulse rounded-lg" />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1">
                <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-lg" />
                <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-lg" />
                <div className="ml-auto h-9 w-32 bg-blue-100 animate-pulse rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Right — Zone list */}
        <div className="xl:col-span-5 flex flex-col">

          {/* Camera filter */}
          <div className="mb-4 space-y-1.5">
            <div className="h-3 w-24 bg-slate-200 animate-pulse rounded" />
            <div className="h-9 w-full bg-slate-100 animate-pulse rounded-md" />
          </div>

          {/* Zone cards */}
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {/* Card header */}
                <div className="px-4 py-3 flex items-center gap-3 border-b border-slate-100">
                  <div className="size-3 rounded-full bg-slate-200 animate-pulse" />
                  <div className="h-4 w-32 bg-slate-200 animate-pulse rounded" />
                  <div className="ml-auto h-3 w-16 bg-slate-100 animate-pulse rounded" />
                  <div className="size-6 bg-slate-100 animate-pulse rounded" />
                </div>
                {/* Card body */}
                <div className="px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-20 bg-slate-100 animate-pulse rounded" />
                    <div className="h-3 w-24 bg-slate-100 animate-pulse rounded" />
                  </div>
                  <div className="h-3 w-40 bg-slate-100 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
