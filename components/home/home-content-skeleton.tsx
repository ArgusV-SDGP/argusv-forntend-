import { MainCameraGridSkeleton } from "./main-camera-grid-skeleton";

export function HomeContentSkeleton() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col border-t border-white/[0.06] bg-[#0a0a0a] text-white lg:h-[calc(100vh-4rem)] lg:flex-row lg:overflow-hidden">
      <MainCameraGridSkeleton />

      <div className="flex min-h-0 w-full flex-col border-t border-white/[0.06] bg-[#0f0f0f] lg:h-full lg:w-80 lg:max-w-80 lg:overflow-hidden lg:border-l lg:border-t-0">
        <div className="shrink-0 border-b border-white/[0.06] p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="h-3 w-24 animate-pulse rounded bg-white/[0.08]" />
            <div className="h-3 w-14 animate-pulse rounded bg-white/[0.06]" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-40 animate-pulse rounded bg-white/[0.06]" />
            <div className="h-3 w-32 animate-pulse rounded bg-white/[0.06]" />
          </div>
        </div>

        <div className="flex-1 p-4 max-lg:max-h-[28rem]">
          <div className="mb-3 h-3 w-28 animate-pulse rounded bg-white/[0.08]" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="h-3 w-20 animate-pulse rounded bg-white/[0.08]" />
                  <div className="h-4 w-14 animate-pulse rounded bg-white/[0.08]" />
                </div>
                <div className="mb-1 h-2.5 w-24 animate-pulse rounded bg-white/[0.06]" />
                <div className="mb-2 h-2.5 w-16 animate-pulse rounded bg-white/[0.06]" />
                <div className="h-2.5 w-full animate-pulse rounded bg-white/[0.06]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
