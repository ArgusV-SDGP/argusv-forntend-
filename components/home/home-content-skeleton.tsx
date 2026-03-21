import { MainCameraGridSkeleton } from "./main-camera-grid-skeleton";

export function HomeContentSkeleton() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col border-t border-gray-200 bg-white text-slate-900 lg:h-[calc(100vh-4rem)] lg:flex-row lg:overflow-hidden">
      <MainCameraGridSkeleton />

      <div className="flex min-h-0 w-full flex-col border-t border-gray-200 bg-white lg:h-full lg:w-80 lg:overflow-hidden lg:border-l lg:border-t-0">
        <div className="shrink-0 border-b border-gray-100 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-14 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-40 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
          </div>
        </div>

        <div className="flex-1 p-4">
          <div className="mb-3 h-3 w-28 animate-pulse rounded bg-slate-200" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="rounded-md border border-gray-100 bg-slate-50 p-3"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-14 animate-pulse rounded bg-slate-200" />
                </div>
                <div className="mb-1 h-2.5 w-24 animate-pulse rounded bg-slate-100" />
                <div className="mb-2 h-2.5 w-16 animate-pulse rounded bg-slate-100" />
                <div className="h-2.5 w-full animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
