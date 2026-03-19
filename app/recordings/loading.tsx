function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/80 ${className}`} />;
}

export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] overflow-x-hidden bg-slate-50 p-4 font-sans text-slate-800 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4">
        <SkeletonBlock className="h-10 w-72" />
        <SkeletonBlock className="h-24 w-full" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-7">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-4 py-3">
              <SkeletonBlock className="h-5 w-40 rounded-md" />
              <div className="flex gap-2">
                <SkeletonBlock className="h-6 w-6 rounded-md" />
                <SkeletonBlock className="h-6 w-6 rounded-md" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <SkeletonBlock className="h-[16rem] w-full rounded-none md:h-[20rem] xl:h-[24rem]" />

              <div className="border-t border-slate-200 bg-slate-50 p-4 lg:border-l lg:border-t-0">
                <div className="mb-3 flex items-center justify-between">
                  <SkeletonBlock className="h-4 w-24 rounded-md" />
                  <SkeletonBlock className="h-4 w-20 rounded-md" />
                </div>

                <div className="space-y-3">
                  <SkeletonBlock className="h-16 w-full rounded-xl" />
                  <SkeletonBlock className="h-16 w-full rounded-xl" />
                  <SkeletonBlock className="h-16 w-full rounded-xl" />
                  <SkeletonBlock className="h-16 w-full rounded-xl" />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-white p-4">
              <SkeletonBlock className="h-44 w-full rounded-2xl" />
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-2.5">
              <div className="flex gap-3">
                <SkeletonBlock className="h-4 w-4 rounded-full" />
                <SkeletonBlock className="h-4 w-4 rounded-full" />
                <SkeletonBlock className="h-4 w-4 rounded-full" />
                <SkeletonBlock className="h-4 w-8 rounded-md" />
              </div>
              <SkeletonBlock className="h-4 w-4 rounded-full" />
            </div>
          </div>
        </div>

        <div className="xl:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <SkeletonBlock className="h-5 w-40 rounded-md" />
              <SkeletonBlock className="h-5 w-16 rounded-md" />
            </div>

            <div className="space-y-3">
              <SkeletonBlock className="h-24 w-full rounded-xl" />
              <SkeletonBlock className="h-24 w-full rounded-xl" />
              <SkeletonBlock className="h-24 w-full rounded-xl" />
              <SkeletonBlock className="h-24 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
