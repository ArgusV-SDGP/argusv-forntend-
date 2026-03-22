import { Eye, Filter, Shield, Zap } from "lucide-react";

export function DetectionsPageSkeleton() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0a0a0a] p-4 font-sans text-white md:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#18ffbe]/10 p-2">
            <Eye className="size-5 text-[#18ffbe]/30" />
          </div>
          <div className="space-y-2">
            <div className="h-6 w-36 animate-pulse rounded bg-white/[0.08]" />
            <div className="h-4 w-72 animate-pulse rounded bg-white/[0.05]" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-24 animate-pulse rounded-lg bg-white/[0.06]" />
          <div className="h-8 w-20 animate-pulse rounded-lg bg-white/[0.06]" />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-4 h-10 w-10 animate-pulse rounded-xl bg-white/[0.08]" />
            <div className="mb-2 h-3 w-24 animate-pulse rounded bg-white/[0.06]" />
            <div className="mb-2 h-7 w-20 animate-pulse rounded bg-white/[0.08]" />
            <div className="h-3 w-28 animate-pulse rounded bg-white/[0.05]" />
          </div>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {[Shield, Zap, Shield].map((Icon, index) => (
          <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-white/40">
              <Icon className="size-4 text-white/20" />
              <div className="h-4 w-24 animate-pulse rounded bg-white/[0.08]" />
            </h2>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, rowIndex) => (
                <div key={rowIndex}>
                  <div className="mb-1 flex justify-between">
                    <div className="h-3 w-16 animate-pulse rounded bg-white/[0.06]" />
                    <div className="h-3 w-10 animate-pulse rounded bg-white/[0.06]" />
                  </div>
                  <div className="h-2 animate-pulse rounded-full bg-white/[0.06]" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <Filter className="size-4 text-white/20" />
        <div className="h-9 w-36 animate-pulse rounded-lg bg-white/[0.06]" />
        <div className="h-9 w-36 animate-pulse rounded-lg bg-white/[0.06]" />
        <div className="h-9 w-28 animate-pulse rounded-lg bg-white/[0.06]" />
      </div>

      <div className="space-y-1.5">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-12 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.03]"
          />
        ))}
      </div>
    </div>
  );
}
