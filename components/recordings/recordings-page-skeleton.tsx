import { Camera, Clock, Film, Play } from "lucide-react";

export function RecordingsPageSkeleton() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 font-sans text-slate-800 md:p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <Film className="size-6 text-blue-200" />
        <div className="space-y-2">
          <div className="h-6 w-36 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-slate-100" />
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <Camera className="size-5 shrink-0 text-slate-300" />
        <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
        <div className="h-9 w-48 animate-pulse rounded-lg bg-slate-100" />
        <div className="ml-auto h-4 w-20 animate-pulse rounded bg-slate-100" />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="shrink-0 lg:w-80">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-600">
            <Clock className="size-4" /> Timeline
          </h2>
          <div className="space-y-1.5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-lg border border-slate-200 bg-white"
              />
            ))}
          </div>
        </div>

        <div className="flex-1">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-600">
            <Play className="size-4" /> Player
          </h2>
          <div className="overflow-hidden rounded-xl bg-white shadow-lg">
            <div className="aspect-video animate-pulse bg-slate-200" />
            <div className="flex gap-4 px-4 py-3">
              <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-12 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
