export function BirdseyePageSkeleton() {
  return (
    <div className="min-h-[calc(100vh-4rem)] animate-pulse bg-[#0a0a0a] p-4 font-sans text-white md:p-6 lg:p-8">
      {/* Header skeleton */}
      <div className="mb-6 flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-7 w-40 rounded-lg bg-white/[0.06]" />
          <div className="h-4 w-72 rounded-md bg-white/[0.04]" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-6 w-20 rounded-full bg-white/[0.06]" />
          <div className="h-6 w-20 rounded-full bg-white/[0.04]" />
        </div>
      </div>

      {/* Frame skeleton */}
      <div className="h-64 rounded-2xl border border-white/[0.06] bg-white/[0.02] md:h-[540px]" />

      {/* Footer skeleton */}
      <div className="mt-3 h-4 w-48 rounded-md bg-white/[0.04]" />
    </div>
  );
}
