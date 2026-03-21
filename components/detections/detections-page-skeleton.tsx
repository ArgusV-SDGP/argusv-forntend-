import { Eye, Filter, Shield, Zap } from "lucide-react";

export function DetectionsPageSkeleton() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 font-sans text-slate-800 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Eye className="size-6 text-violet-200" />
          <div className="space-y-2">
            <div className="h-6 w-36 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-72 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-24 animate-pulse rounded-lg bg-white" />
          <div className="h-8 w-20 animate-pulse rounded-lg bg-white" />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
            <div className="mb-2 h-3 w-24 animate-pulse rounded bg-slate-100" />
            <div className="mb-2 h-7 w-20 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {[Shield, Zap, Shield].map((Icon, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
              <Icon className="size-4 text-slate-300" />
              <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
            </h2>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, rowIndex) => (
                <div key={rowIndex}>
                  <div className="mb-1 flex justify-between">
                    <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-10 animate-pulse rounded bg-slate-100" />
                  </div>
                  <div className="h-2 animate-pulse rounded-full bg-slate-100" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <Filter className="size-4 text-slate-300" />
        <div className="h-9 w-36 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-9 w-36 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-9 w-28 animate-pulse rounded-lg bg-slate-100" />
      </div>

      <div className="space-y-1.5">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-12 animate-pulse rounded-xl border border-slate-200 bg-white"
          />
        ))}
      </div>
    </div>
  );
}
