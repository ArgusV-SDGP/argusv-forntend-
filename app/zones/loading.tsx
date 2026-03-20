function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/80 ${className}`} />;
}

export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] overflow-y-auto bg-slate-50 p-4 font-sans text-slate-800 selection:bg-blue-200 md:p-6 lg:p-8">
      <div className="mb-6">
        <SkeletonBlock className="h-10 w-72" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:gap-8 xl:grid-cols-12">
        <div className="flex flex-col gap-6 xl:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <SkeletonBlock className="h-6 w-40 rounded-md" />
              <SkeletonBlock className="h-10 w-32 rounded-xl" />
            </div>
            <SkeletonBlock className="h-[24rem] w-full rounded-2xl" />
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <SkeletonBlock className="h-11 w-full rounded-xl" />
              <SkeletonBlock className="h-11 w-full rounded-xl" />
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <SkeletonBlock className="h-6 w-36 rounded-md" />
              <SkeletonBlock className="h-10 w-24 rounded-xl" />
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
