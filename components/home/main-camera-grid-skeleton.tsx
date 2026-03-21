export function MainCameraGridSkeleton() {
  return (
    <div className="flex-1 min-h-0 bg-slate-100 p-2 sm:p-4 lg:overflow-y-auto">
      <div className="mx-auto max-w-[1500px]">
        <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm sm:rounded-[28px]">
          <div className="aspect-[16/9] min-h-[220px] animate-pulse bg-slate-200 sm:min-h-[320px] md:min-h-[380px] lg:min-h-[420px]" />

          <div className="border-t border-slate-200 p-4 sm:p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="h-6 w-36 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-64 animate-pulse rounded bg-slate-100" />
              </div>

              <div className="flex gap-2">
                <div className="h-8 w-28 animate-pulse rounded-full bg-slate-200" />
                <div className="h-8 w-24 animate-pulse rounded-full bg-slate-100" />
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 h-10 w-40 animate-pulse rounded-full bg-slate-200" />

              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-10 w-28 animate-pulse rounded-full bg-white"
                  />
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[24px] border border-slate-200 bg-white p-4"
                >
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                    <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />
                  </div>

                  <div className="space-y-2">
                    <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
