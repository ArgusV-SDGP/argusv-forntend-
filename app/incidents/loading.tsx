function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/80 ${className}`} />;
}

export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] overflow-y-auto bg-slate-50 p-4 font-sans text-slate-800 selection:bg-blue-200 md:p-6 lg:p-8">
      <div className="mb-6">
        <SkeletonBlock className="h-10 w-72" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SkeletonBlock className="h-28 w-full" />
        <SkeletonBlock className="h-28 w-full" />
        <SkeletonBlock className="h-28 w-full" />
        <SkeletonBlock className="h-28 w-full" />
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <SkeletonBlock className="h-11 w-full rounded-xl lg:col-span-1" />
          <SkeletonBlock className="h-11 w-full rounded-xl" />
          <SkeletonBlock className="h-11 w-full rounded-xl" />
          <SkeletonBlock className="h-11 w-full rounded-xl" />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <SkeletonBlock className="h-6 w-40 rounded-md" />
          <SkeletonBlock className="h-10 w-28 rounded-xl" />
        </div>

        <div className="space-y-3">
          <SkeletonBlock className="h-28 w-full rounded-xl" />
          <SkeletonBlock className="h-28 w-full rounded-xl" />
          <SkeletonBlock className="h-28 w-full rounded-xl" />
          <SkeletonBlock className="h-28 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
