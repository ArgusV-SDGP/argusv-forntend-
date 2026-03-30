import { Bot } from "lucide-react";

export default function ChatSkeleton() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#0a0a0a]">

      {/* Top bar skeleton */}
      <div className="shrink-0 bg-[#0f0f0f] border-b border-white/[0.06] px-4 md:px-6 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-[#18ffbe]/10 border border-[#18ffbe]/20 flex items-center justify-center">
            <Bot className="size-4 text-[#18ffbe]/50" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3.5 w-24 bg-white/[0.08] animate-pulse rounded" />
            <div className="h-2.5 w-40 bg-white/[0.05] animate-pulse rounded" />
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="h-7 w-32 bg-white/[0.06] animate-pulse rounded-lg" />
          <div className="h-7 w-24 bg-white/[0.06] animate-pulse rounded-lg" />
        </div>
      </div>

      {/* Messages area skeleton */}
      <div className="flex-1 px-4 md:px-6 py-6 space-y-6">
        {/* Bot bubble */}
        <div className="flex gap-3">
          <div className="size-8 rounded-full bg-white/[0.06] border border-white/10 animate-pulse shrink-0 mt-1" />
          <div className="space-y-2 max-w-sm">
            <div className="h-10 w-64 border border-white/[0.08] bg-white/[0.04] animate-pulse rounded-2xl rounded-tl-sm" />
          </div>
        </div>
        {/* User bubble */}
        <div className="flex gap-3 flex-row-reverse">
          <div className="size-8 rounded-full bg-[#18ffbe]/10 border border-[#18ffbe]/20 animate-pulse shrink-0 mt-1" />
          <div className="space-y-2 max-w-sm">
            <div className="h-10 w-48 bg-[#18ffbe]/10 border border-[#18ffbe]/20 animate-pulse rounded-2xl rounded-tr-sm" />
          </div>
        </div>
        {/* Bot bubble with sources */}
        <div className="flex gap-3">
          <div className="size-8 rounded-full bg-white/[0.06] border border-white/10 animate-pulse shrink-0 mt-1" />
          <div className="space-y-3 flex-1 max-w-lg">
            <div className="h-16 border border-white/[0.08] bg-white/[0.04] animate-pulse rounded-2xl rounded-tl-sm" />
            <div className="h-2.5 w-28 bg-white/[0.06] animate-pulse rounded" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-white/[0.06]">
                  <div className="h-24 bg-white/[0.04] animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="h-2.5 w-20 bg-white/[0.06] animate-pulse rounded" />
                    <div className="h-2 w-32 bg-white/[0.05] animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Input skeleton */}
      <div className="shrink-0 bg-[#0f0f0f] border-t border-white/[0.06] px-4 md:px-6 py-4">
        <div className="flex items-end gap-3">
          <div className="flex-1 h-11 bg-white/[0.06] animate-pulse rounded-xl" />
          <div className="size-11 bg-white/[0.06] animate-pulse rounded-xl shrink-0" />
        </div>
        <div className="h-2 w-56 bg-white/[0.04] animate-pulse rounded mt-2 mx-auto" />
      </div>

    </div>
  );
}
